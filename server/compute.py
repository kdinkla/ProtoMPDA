import numpy as np
import pandas as pd
import itertools
import json
import numpyData as data    # Swappable data backend.
from wrapt import synchronized
from sklearn.ensemble import RandomForestClassifier
from scipy.ndimage.morphology import grey_erosion
from multiprocessing.dummy import Pool  # Use multi-threading instead of multi-processing; synchronize functions!
from cache import lru_cache

# Names of available data sets.
def dataSets():
    return data.dataSetPaths.keys()

# Data set configuration.
def configuration(dataSet):
    return data.config(dataSet)

# Data set input conversion.
def dataSet(data):
    return str(data).replace('"', "")

# Feature set input conversion.
def featureSet(features):
    return frozenset(json.loads(features))

# Object set input conversion.
def objectSet(objects):
    return frozenset(json.loads(objects))

# One to one mapping.
def objectDict(objDict):
    dict = json.loads(objDict)
    tpls = [(id, object) for id, object in dict.iteritems()]
    return frozenset(tpls)

# Exemplar dictionary input conversion.
def exemplarDict(exemplars):
    dict = json.loads(exemplars)
    tpls = [(id, frozenset(objects)) for id, objects in dict.iteritems()]
    return frozenset(tpls)

# Load and combine multiple columns into a data frame.
#@lru_cache(maxsize=100)
def columns(dataSet, columns):
    cols = list(columns)
    return data.columnsDump(dataSet, cols)

# Retrieve well annotations.
@lru_cache(maxsize=5)
def wellAnnotations(dataSet):
    return data.wellAnnotations(dataSet)

# Small sample for visualizations.
@lru_cache(maxsize=5)
def smallSample(dataSet):
    return data.objectSample(dataSet, 10**3)

# Well coordinate information for all objects.
@lru_cache(maxsize=5)
def wellIndex(dataSet):
    return data.columnsDump(dataSet, data.systemObjectColumns)

def ftrMet(dataSet, ftr):
    col = data.numpyDump(dataSet, ftr)
    return {metric: np.asscalar(getattr(np, metric)(col)) for metric in ['min', 'max', 'mean']}

@synchronized
@lru_cache(maxsize=5)
def featureMetrics(dataSet):
    print "Computing image feature metrics for " + dataSet
    return {feature: ftrMet(dataSet, feature) for feature in data.imageFeatures(dataSet)}

@lru_cache(maxsize=5)
def wellToObjects(dataSet):
    return wellIndex(dataSet).groupby(['plate', 'row', 'column']).groups

# Restrict sample features to those of images.
def selectImageFeatures(dataSet, subset):
    return subset[data.imageFeatures(dataSet)]

#@memory.cache
# def logicleSet(vec, minimum=None, maximum=None):
#     vecMin = vec.min() if minimum is None else minimum
#     vecMax = vec.max() if maximum is None else maximum
#     rNeg = min(0, vecMin)
#     rMax = abs(vecMax)
#     decades = max(1, abs(math.ceil(math.log10(rMax))))
#     scaleTop = rMax
#
#     logicleVec = _logicle(vec, T=scaleTop, m=decades, r=rNeg, w=0.5)
#
#     return logicleVec

def minMaxScale(vec, vecMin, vecMax):
    return (vec - vecMin) / (vecMax - vecMin)

# Assume that the features are scaled, and behave decently, already. Do normalize to [0,1].
# TODO: add client-side marking for log scaled features.
def adaptiveScale(vec, metrics):
    vecMin = metrics['min']
    vecMax = metrics['max']
    #vecMean = metrics['mean']
    minMaxed = minMaxScale(vec, vecMin, vecMax)
    return minMaxed     #np.log(1 + 100000 * minMaxed) / np.log(100000) if vecMean - vecMin < 0.2 * (vecMax - vecMean) else minMaxed

def scale(dataSet, subset):
    subset = subset.copy()
    metrics = featureMetrics(dataSet)
    for col in subset.columns:
        subset[col] = adaptiveScale(subset[col].values, metrics[col])
    return subset

def scaledSmallSample(dataSet):
    return scale(selectImageFeatures(dataSet, smallSample))

@synchronized
@lru_cache(maxsize=100)
def scaledArray(dataSet, column):
    return adaptiveScale(data.numpyDump(dataSet, column), featureMetrics(dataSet)[column])

def scaledColumns(dataSet, columns):
    return pd.DataFrame(index=wellIndex(dataSet).index, data={c: scaledArray(dataSet, c) for c in columns})

def dataFrameToDict(frame):
    return {str(k): v for k, v in frame.to_dict().iteritems()}

@lru_cache(maxsize=5)
def featureOrdering(dataSet):
    from ordering.rearrange import rearrange

    print "Order features by correlation"
    objectSet = selectImageFeatures(dataSet, smallSample(dataSet))
    corr = objectSet.corr()
    distances = 1 - corr.abs()
    rearrangedSubset = rearrange(distances.values)

    ftrs = data.imageFeatures(dataSet)
    return [ftrs[i] for i in rearrangedSubset]

@lru_cache(maxsize=5)
def featureInfo(dataSet):
    return featureOrdering(dataSet)

@synchronized
@lru_cache(maxsize=5)
def clusters(dataSet, features, exemplars):
    ftrs = list(features)

    predicted = np.empty(len(wellIndex(dataSet)), dtype=np.int)

    if ftrs and exemplars:
        valueMatrix = np.matrix([scaledArray(dataSet, ftr) for ftr in features], copy=False).transpose()

        exemplarDict = dict(exemplars)
        exemplarObjects = np.array([exObj for exObjects in exemplarDict.values() for exObj in exObjects], dtype=np.int)
        exemplarLabels = np.array([exId for exId, exObjects in exemplarDict.iteritems() for exObj in exObjects], dtype=np.int)

        print "Begin training"
        trainingValues = np.take(valueMatrix, exemplarObjects, axis=0)
        forest = RandomForestClassifier(n_estimators=10, n_jobs=-1, class_weight="balanced")
        forest = forest.fit(trainingValues, exemplarLabels)
        print "End training"

        print "Begin classification"
        predicted = forest.predict(valueMatrix)
        print "End classification"
    else:
        predicted.fill(1)   # 1 is reserved in case no phenotypes have been defined yet.

    # Partition predicted column to object indices.
    return predicted

@synchronized
@lru_cache(maxsize=5)
def clustersAsMap(dataSet, features, exemplars):
    clst = clusters(dataSet, features, exemplars)
    return {int(id): np.where(clst == int(id))[0]
            for id in (dict(exemplars).keys() if len(exemplars) > 0 and len(features) > 0 else [1])}

@lru_cache(maxsize=5)
def closestObject(dataSet, probes):
    result = []

    if len(probes) > 0:
        diffs = [np.square(scaledArray(dataSet, col) - coordinate) for col, coordinate in probes]
        distances = np.sqrt(np.sum(diffs, axis=0))
        result = [np.argmin(distances)]

    return result

@lru_cache(maxsize=5)
def allObjects(dataSet, column, row, plate, exemplars, probes):
    allExemplars = list(itertools.chain.from_iterable(cls[1] for cls in exemplars))
    wellObjectMap = wellToObjects(dataSet)
    wellObjects = wellObjectMap[(plate, row, column)] if column >= 0 and (plate, row, column) in wellObjectMap else []
    probeObject = closestObject(dataSet, probes)
    return list(set(allExemplars + wellObjects + probeObject))

@lru_cache(maxsize=5)
def objectInfo(dataSet, featureSet, column, row, plate, exemplars, probes):
    objects = allObjects(dataSet, column, row, plate, exemplars, probes)
    combined = wellIndex(dataSet).loc[objects].copy()

    for ftr in featureSet:
        combined[ftr] = np.take(scaledArray(dataSet, ftr), objects)

    # Generate well URLs on the spot, based on config.
    wellImages = data.config(dataSet).wellImages
    for name, urlFunction in wellImages.iteritems():
        combined["img_" + name] = combined.apply(
            lambda row: urlFunction(int(row['plate']), int(row['column']), int(row['row'])), axis=1)

    return combined

def histoLog(counts):
    return np.where(counts > 0, (np.log(counts) / 2 + 1), 0)

def featureHistogram(args):
    (dataSet, featureSet, exemplars, feature, cluster, bins) = args
    clusterMap = clustersAsMap(dataSet, featureSet, exemplars)[cluster]
    prunedColumn = np.take(scaledArray(dataSet, feature), clusterMap)
    digitized = (prunedColumn * bins).astype(np.int8)
    return feature, cluster, {i: cnt for i, cnt in enumerate(np.bincount(digitized, minlength=bins))}

@lru_cache(maxsize=5)
def featureHistograms(dataSet, featureSet, exemplars, bins):
    partition = clustersAsMap(dataSet, featureSet, exemplars)

    # All computation combinations.
    #print "Compute feature histograms."
    tasks = [(dataSet, featureSet, exemplars, feature, cluster, bins)
             for feature in data.imageFeatures(dataSet)
             for cluster, clusterMap in partition.iteritems()]

    pool = Pool()
    results = pool.imap(featureHistogram, tasks)
    pool.close()
    pool.join()

    histograms = {c: {} for c, table in partition.iteritems()}
    for feature, cluster, histogram in results:
        histograms[cluster][feature] = histogram
    #print "Finish compute feature histograms."

    return histograms

@lru_cache(maxsize=5)
def wellClusterShares(dataSet, features, exemplars):
    print "Join clustering and well info."
    sampleWellsClst = wellIndex(dataSet)[['plate', 'column', 'row']].copy()
    sampleWellsClst['population'] = clusters(dataSet, features, exemplars)

    print "Start pivot table."
    pivoted = pd.pivot_table(sampleWellsClst,
                             columns=['population'],
                             index=['plate', 'column', 'row'],
                             aggfunc=len)
    total = pivoted.sum(axis='columns')
    #maxTotal = total.max()
    pivoted = pivoted.divide(total, axis='index')
    pivoted['0'] = total
    print "Finish pivot table."

    return pivoted

@lru_cache(maxsize=5)
def wellClusterSharesFlat(dataSet, features, exemplars):
    wellShares = wellClusterShares(dataSet, features, exemplars)
    wellShares['plate'] = wellShares.index.get_level_values('plate').astype(str)
    wellShares['column'] = wellShares.index.get_level_values('column').astype(str)
    wellShares['row'] = wellShares.index.get_level_values('row').astype(str)
    wellShares['well'] = wellShares['plate'] + "_" + wellShares['column'] + "_" + wellShares['row']
    return wellShares.set_index('well').drop(['plate', 'column', 'row'], axis=1)

#@lru_cache(maxsize=20)
def objectHistogram2D(args):
    (dataSet, features, exemplars, xFeature, yFeature, bins) = args
    partition = clustersAsMap(dataSet, features, exemplars)

    # Contour maps per cluster.
    contours = {}
    kernel = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]  # Morphology kernel.
    for cluster, objects in partition.iteritems():
        tBins = bins - 1
        xCol = (np.take(scaledArray(dataSet, xFeature), objects) * tBins).astype(np.int16)
        yCol = (np.take(scaledArray(dataSet, yFeature), objects) * tBins).astype(np.int16)
        digitized = (xCol * bins) + yCol
        counts = np.bincount(digitized, minlength=bins*bins)
        counts.shape = (bins, bins)

        # Scale histogram densities to base 10 logarithm levels.
        levels = histoLog(counts).astype(np.int8)

        # Level set outlines as contours (retain level as outline number).
        eroded = grey_erosion(levels, footprint=kernel, mode='constant')
        difference = np.sign(levels - eroded)
        levelContours = np.multiply(difference, levels)

        contours[str(cluster)] = levelContours

    return xFeature, yFeature, contours

def objectHistogramMatrix(dataSet, features, exemplars, bins):
    pool = Pool()
    tasks = [(dataSet, features, exemplars, xFtr, yFtr, bins) for yFtr in features for xFtr in features if xFtr < yFtr]
    results = pool.imap(objectHistogram2D, tasks)
    pool.close()
    pool.join()

    histograms = {ftr2: {ftr1: {} for ftr1 in features} for ftr2 in features}
    for xFeature, yFeature, contours in results:
        for c, lvlCnt in contours.iteritems():
            histograms[xFeature][yFeature][c] = lvlCnt.tolist()
            histograms[yFeature][xFeature][c] = lvlCnt.transpose().tolist()     # Transpose for the inverse pair.

    return histograms

def forObjectFeatureValues(args):
    (dataSet, col, objects) = args
    return col, np.take(scaledArray(dataSet, col), objects)

def objectFeatureValues(dataSet, column, row, plate, exemplars, probes):
    objects = allObjects(dataSet, column, row, plate, exemplars, probes)
    cols = data.imageFeatures(dataSet)

    pool = Pool()
    results = pool.imap(forObjectFeatureValues, [(dataSet, col, objects) for col in cols])
    pool.close()
    pool.join()

    mrg = pd.DataFrame(index=objects, columns=cols)
    for c, vals in results:
        mrg[c] = vals

    return mrg