import config
import csv

# Convert CellMorph well annotation CSV to conformant CSV.

# Invert column tags.
columnIndex = {tag: index for index, tag in enumerate(config.columns)}
rowIndex = {tag: index for index, tag in enumerate(config.rows)}

inputPath = "data/CellMorphWellAnnotation.tab"
outputPath = "data/wells.tab"
with open(outputPath, 'w') as outputFile:
    writer = csv.DictWriter(outputFile, fieldnames=['plate', 'column', 'row', 'Gene'], delimiter='\t')
    writer.writeheader()

    for attributes in csv.DictReader(open(inputPath), delimiter='\t'):
        inputColumn = attributes['384well'][:1]
        inputRow = '0' + attributes['384well'][1:]

        if inputColumn in columnIndex and inputRow in rowIndex:
            plate = int(attributes['384plate']) - 1
            column = columnIndex[inputColumn]
            row = rowIndex[inputRow]
            genes = "|".join(attributes['CalculatedGeneTarget'].split('&'))    # List notation as item1|item2|item3

            writer.writerow({
                'plate': plate,
                'column': column,
                'row': row,
                'Gene': genes
            })



