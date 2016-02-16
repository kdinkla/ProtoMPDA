///<reference path="references.d.ts"/>

import style = require('./core/graphics/style');
import _ = require('lodash');

import Snippet = require('./core/graphics/snippet');
import LabelStyle = Snippet.LabelStyle;

import Color = style.Color;
import Font = style.Font;

import math = require('./core/math');
import Vector = math.Vector;

export class BaseConfiguration {
    backgroundColor = new Color(247, 247, 240);
    font = new Font(16, 200);
    sideFont = new Font(10);

    // User adjustable options.
    imageType: string = null;   // The type of image to present.

    // Default palette.
    base = Color.grey(75);
    baseEmphasis = Color.BLACK;
    baseMuted = Color.grey(140);
    baseDim = Color.grey(200);
    baseVeryDim = Color.grey(225);
    baseSelected = new Color(25, 50, 255);    //new Color(185, 28, 48);  //Color.CRIMSON;
    highlight = Color.grey(50);     // Focused highlight color.
    highlightTrans = Color.grey(50, 0.75);

    // Panel configuration.
    panelSpace = 20;
    subPanelSpace = 10;
    panelHeaderFont = new Font(16);
    panelHeaderSpace = this.panelHeaderFont.size + 15;
    panelHeaderColor = this.baseDim;
    panelHeaderLabel = new LabelStyle(this.panelHeaderFont, this.panelHeaderColor, 'left', 'top', .25 * Math.PI);
    panelHeaderOpenLabel = new LabelStyle(this.panelHeaderFont, this.base, 'left', 'top');
    subPanelHeaderLabel = new LabelStyle(new Font(14), this.base, 'left', 'top');

    // Guide labels.
    guideStyle = new LabelStyle(new Font(12, 180), Color.CRIMSON, 'left', 'top');
    bigGuideStyle = new LabelStyle(new Font(32, 180), Color.CRIMSON, 'left', 'top');
    guideArrowLength = 5;
    guideVisible = false;

    // Features.
    featureFont = new Font(10);
    featureCellSpace = [4, 2];
    featureCellDimensions = [50, this.featureFont.size];
    featureSplit = 'joint'; // else 'separate'

    // Scatter plots.
    minDotSize = 1;
    maxDotSize = 3;

    // Cluster view.
    windowMargin = 5;
    scatterPlotFont = new Font(6);
    featureSpace = 80;
    clusterSpace = 40;
    tableSideMargin = 60;
    featureMargin = 20;
    binMargin = 5;
    controlShareHeight = 20;

    // Splom view.
    splomColor = new Color(247, 247, 247);
    splomInnerSize = 90;
    splomSpace = 5;
    splomSize = this.splomInnerSize + this.splomSpace;
    splomClusterRadius = 3;
    splomDotRadius = 1;
    splomDotDensityColor = Color.grey(0, 0.2);
    splomRepresentativeOuterDotRadius = 3;
    splomRepresentativeInnerDotRadius = 2;
    scatterPlotSize = this.splomSize + this.splomInnerSize;

    // Cluster list.
    clusterTileSpace = 5;
    clusterTileInnerSize = 0.5 * (this.splomInnerSize - this.clusterTileSpace);
    clusterTileSize = this.clusterTileInnerSize + this.clusterTileSpace;
    clusterPlateDotRadius = 1.5;
    clusterLabel = new LabelStyle(this.sideFont, this.baseDim);
    clusterSelectedLabel = new LabelStyle(this.sideFont, this.baseEmphasis);
    clusterAdditionLabel = new Font(34);    //new LabelStyle(new Font(30), this.baseSelected);
    exemplarSpace = 1;
    exemplarColumnSpace = 4 * this.exemplarSpace;

    // Plate view.
    wellRadius = 7;
    wellDiameter = 2 * this.wellRadius;
    wellInnerRadius = 4;
    plateColLabelMargin = 1;
    plateRowLabelMargin = 3;

    // Plate index view.
    plateWidth = 4;
    plateIndexInnerHeight = 10;
    plateIndexSpace = 5;
    plateIndexMargin = 5;

    // Plate cluster shares.
    static voidColor = Color.NONE;  //new Color(222, 220, 220);   //Color.NONE;  //Color.GREEN;
    static shareColorMap = (normVal: number) => (normVal >= 0 ? heatLookup[Math.ceil(255 * (1 - normVal))] :
                                                BaseConfiguration.voidColor);

    //(normVal: number) => style.Color.grey(0, normVal > 0 ? Math.sqrt(normVal) : 0); //style.Color.grey(Math.ceil(255 * (1 - normVal)));

    // Plate mini heatmap view.
    miniHeatWellDiameter = 2;
    miniHeatSpace = 1;
    miniHeatColumnCount = 5;

    // Well details view.
    wellViewMaxWidth = 600;
    //wellViewMaxDim = [500, 370];

    // Object details view.
    objectViewImageRadius = 40;
}

export class NumberTableConfiguration {
    cellOuterDimensions: number[];

    constructor(public font: Font = new Font(12),
                public fontColor: Color = Color.BLACK,
                public cellDimensions: number[] = [40, 14],
                public cellSpace: number[] = [2, 2],
                public visibleIndex: boolean = true,
                public visibleHeader: boolean = true) {
        this.cellOuterDimensions = Vector.add(cellDimensions, cellSpace);
    }
}

// Color maps.
var locsLookup: Color[] = [];
locsLookup[  0] = new Color(   0,   0,   0 );
locsLookup[  1] = new Color(   0,   0,   0 );
locsLookup[  2] = new Color(   0,   0,   0 );
locsLookup[  3] = new Color(   1,   0,   0 );
locsLookup[  4] = new Color(   2,   0,   0 );
locsLookup[  5] = new Color(   2,   0,   0 );
locsLookup[  6] = new Color(   3,   0,   0 );
locsLookup[  7] = new Color(   3,   0,   0 );
locsLookup[  8] = new Color(   4,   0,   0 );
locsLookup[  9] = new Color(   5,   0,   0 );
locsLookup[ 10] = new Color(   5,   0,   0 );
locsLookup[ 11] = new Color(   6,   0,   0 );
locsLookup[ 12] = new Color(   7,   0,   0 );
locsLookup[ 13] = new Color(   7,   0,   0 );
locsLookup[ 14] = new Color(   8,   0,   0 );
locsLookup[ 15] = new Color(   9,   0,   0 );
locsLookup[ 16] = new Color(   9,   0,   0 );
locsLookup[ 17] = new Color(  10,   0,   0 );
locsLookup[ 18] = new Color(  11,   0,   0 );
locsLookup[ 19] = new Color(  12,   0,   0 );
locsLookup[ 20] = new Color(  13,   0,   0 );
locsLookup[ 21] = new Color(  14,   0,   0 );
locsLookup[ 22] = new Color(  15,   0,   0 );
locsLookup[ 23] = new Color(  16,   0,   0 );
locsLookup[ 24] = new Color(  17,   0,   0 );
locsLookup[ 25] = new Color(  18,   0,   0 );
locsLookup[ 26] = new Color(  19,   0,   0 );
locsLookup[ 27] = new Color(  20,   0,   0 );
locsLookup[ 28] = new Color(  21,   0,   0 );
locsLookup[ 29] = new Color(  22,   0,   0 );
locsLookup[ 30] = new Color(  23,   0,   0 );
locsLookup[ 31] = new Color(  25,   0,   0 );
locsLookup[ 32] = new Color(  26,   0,   0 );
locsLookup[ 33] = new Color(  27,   0,   0 );
locsLookup[ 34] = new Color(  28,   0,   0 );
locsLookup[ 35] = new Color(  30,   0,   0 );
locsLookup[ 36] = new Color(  31,   0,   0 );
locsLookup[ 37] = new Color(  33,   0,   0 );
locsLookup[ 38] = new Color(  34,   0,   0 );
locsLookup[ 39] = new Color(  35,   0,   0 );
locsLookup[ 40] = new Color(  37,   0,   0 );
locsLookup[ 41] = new Color(  39,   0,   0 );
locsLookup[ 42] = new Color(  40,   0,   0 );
locsLookup[ 43] = new Color(  43,   0,   0 );
locsLookup[ 44] = new Color(  45,   0,   0 );
locsLookup[ 45] = new Color(  46,   0,   0 );
locsLookup[ 46] = new Color(  49,   0,   0 );
locsLookup[ 47] = new Color(  51,   0,   0 );
locsLookup[ 48] = new Color(  53,   0,   0 );
locsLookup[ 49] = new Color(  54,   0,   0 );
locsLookup[ 50] = new Color(  56,   0,   0 );
locsLookup[ 51] = new Color(  58,   0,   0 );
locsLookup[ 52] = new Color(  60,   0,   0 );
locsLookup[ 53] = new Color(  62,   0,   0 );
locsLookup[ 54] = new Color(  64,   0,   0 );
locsLookup[ 55] = new Color(  67,   0,   0 );
locsLookup[ 56] = new Color(  69,   0,   0 );
locsLookup[ 57] = new Color(  71,   0,   0 );
locsLookup[ 58] = new Color(  74,   0,   0 );
locsLookup[ 59] = new Color(  76,   0,   0 );
locsLookup[ 60] = new Color(  80,   0,   0 );
locsLookup[ 61] = new Color(  81,   0,   0 );
locsLookup[ 62] = new Color(  84,   0,   0 );
locsLookup[ 63] = new Color(  86,   0,   0 );
locsLookup[ 64] = new Color(  89,   0,   0 );
locsLookup[ 65] = new Color(  92,   0,   0 );
locsLookup[ 66] = new Color(  94,   0,   0 );
locsLookup[ 67] = new Color(  97,   0,   0 );
locsLookup[ 68] = new Color( 100,   0,   0 );
locsLookup[ 69] = new Color( 103,   0,   0 );
locsLookup[ 70] = new Color( 106,   0,   0 );
locsLookup[ 71] = new Color( 109,   0,   0 );
locsLookup[ 72] = new Color( 112,   0,   0 );
locsLookup[ 73] = new Color( 115,   0,   0 );
locsLookup[ 74] = new Color( 117,   0,   0 );
locsLookup[ 75] = new Color( 122,   0,   0 );
locsLookup[ 76] = new Color( 126,   0,   0 );
locsLookup[ 77] = new Color( 128,   0,   0 );
locsLookup[ 78] = new Color( 131,   0,   0 );
locsLookup[ 79] = new Color( 135,   0,   0 );
locsLookup[ 80] = new Color( 135,   0,   0 );
locsLookup[ 81] = new Color( 135,   1,   0 );
locsLookup[ 82] = new Color( 135,   2,   0 );
locsLookup[ 83] = new Color( 135,   3,   0 );
locsLookup[ 84] = new Color( 135,   4,   0 );
locsLookup[ 85] = new Color( 135,   6,   0 );
locsLookup[ 86] = new Color( 135,   6,   0 );
locsLookup[ 87] = new Color( 135,   8,   0 );
locsLookup[ 88] = new Color( 135,   9,   0 );
locsLookup[ 89] = new Color( 135,  10,   0 );
locsLookup[ 90] = new Color( 135,  11,   0 );
locsLookup[ 91] = new Color( 135,  13,   0 );
locsLookup[ 92] = new Color( 135,  13,   0 );
locsLookup[ 93] = new Color( 135,  15,   0 );
locsLookup[ 94] = new Color( 135,  17,   0 );
locsLookup[ 95] = new Color( 135,  17,   0 );
locsLookup[ 96] = new Color( 135,  19,   0 );
locsLookup[ 97] = new Color( 135,  21,   0 );
locsLookup[ 98] = new Color( 135,  22,   0 );
locsLookup[ 99] = new Color( 135,  23,   0 );
locsLookup[100] = new Color( 135,  25,   0 );
locsLookup[101] = new Color( 135,  26,   0 );
locsLookup[102] = new Color( 135,  27,   0 );
locsLookup[103] = new Color( 135,  29,   0 );
locsLookup[104] = new Color( 135,  31,   0 );
locsLookup[105] = new Color( 135,  32,   0 );
locsLookup[106] = new Color( 135,  33,   0 );
locsLookup[107] = new Color( 135,  35,   0 );
locsLookup[108] = new Color( 135,  36,   0 );
locsLookup[109] = new Color( 135,  38,   0 );
locsLookup[110] = new Color( 135,  40,   0 );
locsLookup[111] = new Color( 135,  42,   0 );
locsLookup[112] = new Color( 135,  44,   0 );
locsLookup[113] = new Color( 135,  46,   0 );
locsLookup[114] = new Color( 135,  47,   0 );
locsLookup[115] = new Color( 135,  49,   0 );
locsLookup[116] = new Color( 135,  51,   0 );
locsLookup[117] = new Color( 135,  52,   0 );
locsLookup[118] = new Color( 135,  54,   0 );
locsLookup[119] = new Color( 135,  56,   0 );
locsLookup[120] = new Color( 135,  57,   0 );
locsLookup[121] = new Color( 135,  59,   0 );
locsLookup[122] = new Color( 135,  62,   0 );
locsLookup[123] = new Color( 135,  63,   0 );
locsLookup[124] = new Color( 135,  65,   0 );
locsLookup[125] = new Color( 135,  67,   0 );
locsLookup[126] = new Color( 135,  69,   0 );
locsLookup[127] = new Color( 135,  72,   0 );
locsLookup[128] = new Color( 135,  73,   0 );
locsLookup[129] = new Color( 135,  76,   0 );
locsLookup[130] = new Color( 135,  78,   0 );
locsLookup[131] = new Color( 135,  80,   0 );
locsLookup[132] = new Color( 135,  82,   0 );
locsLookup[133] = new Color( 135,  84,   0 );
locsLookup[134] = new Color( 135,  87,   0 );
locsLookup[135] = new Color( 135,  88,   0 );
locsLookup[136] = new Color( 135,  90,   0 );
locsLookup[137] = new Color( 135,  93,   0 );
locsLookup[138] = new Color( 135,  95,   0 );
locsLookup[139] = new Color( 135,  98,   0 );
locsLookup[140] = new Color( 135, 101,   0 );
locsLookup[141] = new Color( 135, 103,   0 );
locsLookup[142] = new Color( 135, 106,   0 );
locsLookup[143] = new Color( 135, 107,   0 );
locsLookup[144] = new Color( 135, 110,   0 );
locsLookup[145] = new Color( 135, 113,   0 );
locsLookup[146] = new Color( 135, 115,   0 );
locsLookup[147] = new Color( 135, 118,   0 );
locsLookup[148] = new Color( 135, 121,   0 );
locsLookup[149] = new Color( 135, 124,   0 );
locsLookup[150] = new Color( 135, 127,   0 );
locsLookup[151] = new Color( 135, 129,   0 );
locsLookup[152] = new Color( 135, 133,   0 );
locsLookup[153] = new Color( 135, 135,   0 );
locsLookup[154] = new Color( 135, 138,   0 );
locsLookup[155] = new Color( 135, 141,   0 );
locsLookup[156] = new Color( 135, 144,   0 );
locsLookup[157] = new Color( 135, 148,   0 );
locsLookup[158] = new Color( 135, 150,   0 );
locsLookup[159] = new Color( 135, 155,   0 );
locsLookup[160] = new Color( 135, 157,   0 );
locsLookup[161] = new Color( 135, 160,   0 );
locsLookup[162] = new Color( 135, 163,   0 );
locsLookup[163] = new Color( 135, 166,   0 );
locsLookup[164] = new Color( 135, 170,   0 );
locsLookup[165] = new Color( 135, 174,   0 );
locsLookup[166] = new Color( 135, 177,   0 );
locsLookup[167] = new Color( 135, 180,   0 );
locsLookup[168] = new Color( 135, 184,   0 );
locsLookup[169] = new Color( 135, 188,   0 );
locsLookup[170] = new Color( 135, 192,   0 );
locsLookup[171] = new Color( 135, 195,   0 );
locsLookup[172] = new Color( 135, 200,   0 );
locsLookup[173] = new Color( 135, 203,   0 );
locsLookup[174] = new Color( 135, 205,   0 );
locsLookup[175] = new Color( 135, 210,   0 );
locsLookup[176] = new Color( 135, 214,   0 );
locsLookup[177] = new Color( 135, 218,   0 );
locsLookup[178] = new Color( 135, 222,   0 );
locsLookup[179] = new Color( 135, 226,   0 );
locsLookup[180] = new Color( 135, 231,   0 );
locsLookup[181] = new Color( 135, 236,   0 );
locsLookup[182] = new Color( 135, 239,   0 );
locsLookup[183] = new Color( 135, 244,   0 );
locsLookup[184] = new Color( 135, 249,   0 );
locsLookup[185] = new Color( 135, 254,   0 );
locsLookup[186] = new Color( 135, 255,   1 );
locsLookup[187] = new Color( 135, 255,   5 );
locsLookup[188] = new Color( 135, 255,  10 );
locsLookup[189] = new Color( 135, 255,  15 );
locsLookup[190] = new Color( 135, 255,  20 );
locsLookup[191] = new Color( 135, 255,  23 );
locsLookup[192] = new Color( 135, 255,  28 );
locsLookup[193] = new Color( 135, 255,  33 );
locsLookup[194] = new Color( 135, 255,  38 );
locsLookup[195] = new Color( 135, 255,  43 );
locsLookup[196] = new Color( 135, 255,  45 );
locsLookup[197] = new Color( 135, 255,  49 );
locsLookup[198] = new Color( 135, 255,  54 );
locsLookup[199] = new Color( 135, 255,  59 );
locsLookup[200] = new Color( 135, 255,  65 );
locsLookup[201] = new Color( 135, 255,  70 );
locsLookup[202] = new Color( 135, 255,  74 );
locsLookup[203] = new Color( 135, 255,  80 );
locsLookup[204] = new Color( 135, 255,  84 );
locsLookup[205] = new Color( 135, 255,  90 );
locsLookup[206] = new Color( 135, 255,  95 );
locsLookup[207] = new Color( 135, 255,  98 );
locsLookup[208] = new Color( 135, 255, 104 );
locsLookup[209] = new Color( 135, 255, 110 );
locsLookup[210] = new Color( 135, 255, 116 );
locsLookup[211] = new Color( 135, 255, 120 );
locsLookup[212] = new Color( 135, 255, 125 );
locsLookup[213] = new Color( 135, 255, 131 );
locsLookup[214] = new Color( 135, 255, 137 );
locsLookup[215] = new Color( 135, 255, 144 );
locsLookup[216] = new Color( 135, 255, 149 );
locsLookup[217] = new Color( 135, 255, 154 );
locsLookup[218] = new Color( 135, 255, 158 );
locsLookup[219] = new Color( 135, 255, 165 );
locsLookup[220] = new Color( 135, 255, 172 );
locsLookup[221] = new Color( 135, 255, 179 );
locsLookup[222] = new Color( 135, 255, 186 );
locsLookup[223] = new Color( 135, 255, 191 );
locsLookup[224] = new Color( 135, 255, 198 );
locsLookup[225] = new Color( 135, 255, 203 );
locsLookup[226] = new Color( 135, 255, 211 );
locsLookup[227] = new Color( 135, 255, 216 );
locsLookup[228] = new Color( 135, 255, 224 );
locsLookup[229] = new Color( 135, 255, 232 );
locsLookup[230] = new Color( 135, 255, 240 );
locsLookup[231] = new Color( 135, 255, 248 );
locsLookup[232] = new Color( 135, 255, 254 );
locsLookup[233] = new Color( 135, 255, 255 );
locsLookup[234] = new Color( 140, 255, 255 );
locsLookup[235] = new Color( 146, 255, 255 );
locsLookup[236] = new Color( 153, 255, 255 );
locsLookup[237] = new Color( 156, 255, 255 );
locsLookup[238] = new Color( 161, 255, 255 );
locsLookup[239] = new Color( 168, 255, 255 );
locsLookup[240] = new Color( 172, 255, 255 );
locsLookup[241] = new Color( 177, 255, 255 );
locsLookup[242] = new Color( 182, 255, 255 );
locsLookup[243] = new Color( 189, 255, 255 );
locsLookup[244] = new Color( 192, 255, 255 );
locsLookup[245] = new Color( 199, 255, 255 );
locsLookup[246] = new Color( 204, 255, 255 );
locsLookup[247] = new Color( 210, 255, 255 );
locsLookup[248] = new Color( 215, 255, 255 );
locsLookup[249] = new Color( 220, 255, 255 );
locsLookup[250] = new Color( 225, 255, 255 );
locsLookup[251] = new Color( 232, 255, 255 );
locsLookup[252] = new Color( 236, 255, 255 );
locsLookup[253] = new Color( 240, 255, 255 );
locsLookup[254] = new Color( 248, 255, 255 );
locsLookup[255] = new Color( 255, 255, 255 );

var heatLookup: Color[] = [];
heatLookup[  0] = new Color(   0,   0,   0 );
heatLookup[  1] = new Color(  35,   0,   0 );
heatLookup[  2] = new Color(  52,   0,   0 );
heatLookup[  3] = new Color(  60,   0,   0 );
heatLookup[  4] = new Color(  63,   1,   0 );
heatLookup[  5] = new Color(  64,   2,   0 );
heatLookup[  6] = new Color(  68,   5,   0 );
heatLookup[  7] = new Color(  69,   6,   0 );
heatLookup[  8] = new Color(  72,   8,   0 );
heatLookup[  9] = new Color(  74,  10,   0 );
heatLookup[ 10] = new Color(  77,  12,   0 );
heatLookup[ 11] = new Color(  78,  14,   0 );
heatLookup[ 12] = new Color(  81,  16,   0 );
heatLookup[ 13] = new Color(  83,  17,   0 );
heatLookup[ 14] = new Color(  85,  19,   0 );
heatLookup[ 15] = new Color(  86,  20,   0 );
heatLookup[ 16] = new Color(  89,  22,   0 );
heatLookup[ 17] = new Color(  91,  24,   0 );
heatLookup[ 18] = new Color(  92,  25,   0 );
heatLookup[ 19] = new Color(  94,  26,   0 );
heatLookup[ 20] = new Color(  95,  28,   0 );
heatLookup[ 21] = new Color(  98,  30,   0 );
heatLookup[ 22] = new Color( 100,  31,   0 );
heatLookup[ 23] = new Color( 102,  33,   0 );
heatLookup[ 24] = new Color( 103,  34,   0 );
heatLookup[ 25] = new Color( 105,  35,   0 );
heatLookup[ 26] = new Color( 106,  36,   0 );
heatLookup[ 27] = new Color( 108,  38,   0 );
heatLookup[ 28] = new Color( 109,  39,   0 );
heatLookup[ 29] = new Color( 111,  40,   0 );
heatLookup[ 30] = new Color( 112,  42,   0 );
heatLookup[ 31] = new Color( 114,  43,   0 );
heatLookup[ 32] = new Color( 115,  44,   0 );
heatLookup[ 33] = new Color( 117,  45,   0 );
heatLookup[ 34] = new Color( 119,  47,   0 );
heatLookup[ 35] = new Color( 119,  47,   0 );
heatLookup[ 36] = new Color( 120,  48,   0 );
heatLookup[ 37] = new Color( 122,  49,   0 );
heatLookup[ 38] = new Color( 123,  51,   0 );
heatLookup[ 39] = new Color( 125,  52,   0 );
heatLookup[ 40] = new Color( 125,  52,   0 );
heatLookup[ 41] = new Color( 126,  53,   0 );
heatLookup[ 42] = new Color( 128,  54,   0 );
heatLookup[ 43] = new Color( 129,  56,   0 );
heatLookup[ 44] = new Color( 129,  56,   0 );
heatLookup[ 45] = new Color( 131,  57,   0 );
heatLookup[ 46] = new Color( 132,  58,   0 );
heatLookup[ 47] = new Color( 134,  59,   0 );
heatLookup[ 48] = new Color( 134,  59,   0 );
heatLookup[ 49] = new Color( 136,  61,   0 );
heatLookup[ 50] = new Color( 137,  62,   0 );
heatLookup[ 51] = new Color( 137,  62,   0 );
heatLookup[ 52] = new Color( 139,  63,   0 );
heatLookup[ 53] = new Color( 139,  63,   0 );
heatLookup[ 54] = new Color( 140,  65,   0 );
heatLookup[ 55] = new Color( 142,  66,   0 );
heatLookup[ 56] = new Color( 142,  66,   0 );
heatLookup[ 57] = new Color( 143,  67,   0 );
heatLookup[ 58] = new Color( 143,  67,   0 );
heatLookup[ 59] = new Color( 145,  68,   0 );
heatLookup[ 60] = new Color( 145,  68,   0 );
heatLookup[ 61] = new Color( 146,  70,   0 );
heatLookup[ 62] = new Color( 146,  70,   0 );
heatLookup[ 63] = new Color( 148,  71,   0 );
heatLookup[ 64] = new Color( 148,  71,   0 );
heatLookup[ 65] = new Color( 149,  72,   0 );
heatLookup[ 66] = new Color( 149,  72,   0 );
heatLookup[ 67] = new Color( 151,  73,   0 );
heatLookup[ 68] = new Color( 151,  73,   0 );
heatLookup[ 69] = new Color( 153,  75,   0 );
heatLookup[ 70] = new Color( 153,  75,   0 );
heatLookup[ 71] = new Color( 154,  76,   0 );
heatLookup[ 72] = new Color( 154,  76,   0 );
heatLookup[ 73] = new Color( 154,  76,   0 );
heatLookup[ 74] = new Color( 156,  77,   0 );
heatLookup[ 75] = new Color( 156,  77,   0 );
heatLookup[ 76] = new Color( 157,  79,   0 );
heatLookup[ 77] = new Color( 157,  79,   0 );
heatLookup[ 78] = new Color( 159,  80,   0 );
heatLookup[ 79] = new Color( 159,  80,   0 );
heatLookup[ 80] = new Color( 159,  80,   0 );
heatLookup[ 81] = new Color( 160,  81,   0 );
heatLookup[ 82] = new Color( 160,  81,   0 );
heatLookup[ 83] = new Color( 162,  82,   0 );
heatLookup[ 84] = new Color( 162,  82,   0 );
heatLookup[ 85] = new Color( 163,  84,   0 );
heatLookup[ 86] = new Color( 163,  84,   0 );
heatLookup[ 87] = new Color( 165,  85,   0 );
heatLookup[ 88] = new Color( 165,  85,   0 );
heatLookup[ 89] = new Color( 166,  86,   0 );
heatLookup[ 90] = new Color( 166,  86,   0 );
heatLookup[ 91] = new Color( 166,  86,   0 );
heatLookup[ 92] = new Color( 168,  87,   0 );
heatLookup[ 93] = new Color( 168,  87,   0 );
heatLookup[ 94] = new Color( 170,  89,   0 );
heatLookup[ 95] = new Color( 170,  89,   0 );
heatLookup[ 96] = new Color( 171,  90,   0 );
heatLookup[ 97] = new Color( 171,  90,   0 );
heatLookup[ 98] = new Color( 173,  91,   0 );
heatLookup[ 99] = new Color( 173,  91,   0 );
heatLookup[100] = new Color( 174,  93,   0 );
heatLookup[101] = new Color( 174,  93,   0 );
heatLookup[102] = new Color( 176,  94,   0 );
heatLookup[103] = new Color( 176,  94,   0 );
heatLookup[104] = new Color( 177,  95,   0 );
heatLookup[105] = new Color( 177,  95,   0 );
heatLookup[106] = new Color( 179,  96,   0 );
heatLookup[107] = new Color( 179,  96,   0 );
heatLookup[108] = new Color( 180,  98,   0 );
heatLookup[109] = new Color( 182,  99,   0 );
heatLookup[110] = new Color( 182,  99,   0 );
heatLookup[111] = new Color( 183, 100,   0 );
heatLookup[112] = new Color( 183, 100,   0 );
heatLookup[113] = new Color( 185, 102,   0 );
heatLookup[114] = new Color( 185, 102,   0 );
heatLookup[115] = new Color( 187, 103,   0 );
heatLookup[116] = new Color( 187, 103,   0 );
heatLookup[117] = new Color( 188, 104,   0 );
heatLookup[118] = new Color( 188, 104,   0 );
heatLookup[119] = new Color( 190, 105,   0 );
heatLookup[120] = new Color( 191, 107,   0 );
heatLookup[121] = new Color( 191, 107,   0 );
heatLookup[122] = new Color( 193, 108,   0 );
heatLookup[123] = new Color( 193, 108,   0 );
heatLookup[124] = new Color( 194, 109,   0 );
heatLookup[125] = new Color( 196, 110,   0 );
heatLookup[126] = new Color( 196, 110,   0 );
heatLookup[127] = new Color( 197, 112,   0 );
heatLookup[128] = new Color( 197, 112,   0 );
heatLookup[129] = new Color( 199, 113,   0 );
heatLookup[130] = new Color( 200, 114,   0 );
heatLookup[131] = new Color( 200, 114,   0 );
heatLookup[132] = new Color( 202, 116,   0 );
heatLookup[133] = new Color( 202, 116,   0 );
heatLookup[134] = new Color( 204, 117,   0 );
heatLookup[135] = new Color( 205, 118,   0 );
heatLookup[136] = new Color( 205, 118,   0 );
heatLookup[137] = new Color( 207, 119,   0 );
heatLookup[138] = new Color( 208, 121,   0 );
heatLookup[139] = new Color( 208, 121,   0 );
heatLookup[140] = new Color( 210, 122,   0 );
heatLookup[141] = new Color( 211, 123,   0 );
heatLookup[142] = new Color( 211, 123,   0 );
heatLookup[143] = new Color( 213, 124,   0 );
heatLookup[144] = new Color( 214, 126,   0 );
heatLookup[145] = new Color( 214, 126,   0 );
heatLookup[146] = new Color( 216, 127,   0 );
heatLookup[147] = new Color( 217, 128,   0 );
heatLookup[148] = new Color( 217, 128,   0 );
heatLookup[149] = new Color( 219, 130,   0 );
heatLookup[150] = new Color( 221, 131,   0 );
heatLookup[151] = new Color( 221, 131,   0 );
heatLookup[152] = new Color( 222, 132,   0 );
heatLookup[153] = new Color( 224, 133,   0 );
heatLookup[154] = new Color( 224, 133,   0 );
heatLookup[155] = new Color( 225, 135,   0 );
heatLookup[156] = new Color( 227, 136,   0 );
heatLookup[157] = new Color( 227, 136,   0 );
heatLookup[158] = new Color( 228, 137,   0 );
heatLookup[159] = new Color( 230, 138,   0 );
heatLookup[160] = new Color( 230, 138,   0 );
heatLookup[161] = new Color( 231, 140,   0 );
heatLookup[162] = new Color( 233, 141,   0 );
heatLookup[163] = new Color( 233, 141,   0 );
heatLookup[164] = new Color( 234, 142,   0 );
heatLookup[165] = new Color( 236, 144,   0 );
heatLookup[166] = new Color( 236, 144,   0 );
heatLookup[167] = new Color( 238, 145,   0 );
heatLookup[168] = new Color( 239, 146,   0 );
heatLookup[169] = new Color( 241, 147,   0 );
heatLookup[170] = new Color( 241, 147,   0 );
heatLookup[171] = new Color( 242, 149,   0 );
heatLookup[172] = new Color( 244, 150,   0 );
heatLookup[173] = new Color( 244, 150,   0 );
heatLookup[174] = new Color( 245, 151,   0 );
heatLookup[175] = new Color( 247, 153,   0 );
heatLookup[176] = new Color( 247, 153,   0 );
heatLookup[177] = new Color( 248, 154,   0 );
heatLookup[178] = new Color( 250, 155,   0 );
heatLookup[179] = new Color( 251, 156,   0 );
heatLookup[180] = new Color( 251, 156,   0 );
heatLookup[181] = new Color( 253, 158,   0 );
heatLookup[182] = new Color( 255, 159,   0 );
heatLookup[183] = new Color( 255, 159,   0 );
heatLookup[184] = new Color( 255, 160,   0 );
heatLookup[185] = new Color( 255, 161,   0 );
heatLookup[186] = new Color( 255, 163,   0 );
heatLookup[187] = new Color( 255, 163,   0 );
heatLookup[188] = new Color( 255, 164,   0 );
heatLookup[189] = new Color( 255, 165,   0 );
heatLookup[190] = new Color( 255, 167,   0 );
heatLookup[191] = new Color( 255, 167,   0 );
heatLookup[192] = new Color( 255, 168,   0 );
heatLookup[193] = new Color( 255, 169,   0 );
heatLookup[194] = new Color( 255, 169,   0 );
heatLookup[195] = new Color( 255, 170,   0 );
heatLookup[196] = new Color( 255, 172,   0 );
heatLookup[197] = new Color( 255, 173,   0 );
heatLookup[198] = new Color( 255, 173,   0 );
heatLookup[199] = new Color( 255, 174,   0 );
heatLookup[200] = new Color( 255, 175,   0 );
heatLookup[201] = new Color( 255, 177,   0 );
heatLookup[202] = new Color( 255, 178,   0 );
heatLookup[203] = new Color( 255, 179,   0 );
heatLookup[204] = new Color( 255, 181,   0 );
heatLookup[205] = new Color( 255, 181,   0 );
heatLookup[206] = new Color( 255, 182,   0 );
heatLookup[207] = new Color( 255, 183,   0 );
heatLookup[208] = new Color( 255, 184,   0 );
heatLookup[209] = new Color( 255, 187,   7 );
heatLookup[210] = new Color( 255, 188,  10 );
heatLookup[211] = new Color( 255, 189,  14 );
heatLookup[212] = new Color( 255, 191,  18 );
heatLookup[213] = new Color( 255, 192,  21 );
heatLookup[214] = new Color( 255, 193,  25 );
heatLookup[215] = new Color( 255, 195,  29 );
heatLookup[216] = new Color( 255, 197,  36 );
heatLookup[217] = new Color( 255, 198,  40 );
heatLookup[218] = new Color( 255, 200,  43 );
heatLookup[219] = new Color( 255, 202,  51 );
heatLookup[220] = new Color( 255, 204,  54 );
heatLookup[221] = new Color( 255, 206,  61 );
heatLookup[222] = new Color( 255, 207,  65 );
heatLookup[223] = new Color( 255, 210,  72 );
heatLookup[224] = new Color( 255, 211,  76 );
heatLookup[225] = new Color( 255, 214,  83 );
heatLookup[226] = new Color( 255, 216,  91 );
heatLookup[227] = new Color( 255, 219,  98 );
heatLookup[228] = new Color( 255, 221, 105 );
heatLookup[229] = new Color( 255, 223, 109 );
heatLookup[230] = new Color( 255, 225, 116 );
heatLookup[231] = new Color( 255, 228, 123 );
heatLookup[232] = new Color( 255, 232, 134 );
heatLookup[233] = new Color( 255, 234, 142 );
heatLookup[234] = new Color( 255, 237, 149 );
heatLookup[235] = new Color( 255, 239, 156 );
heatLookup[236] = new Color( 255, 240, 160 );
heatLookup[237] = new Color( 255, 243, 167 );
heatLookup[238] = new Color( 255, 246, 174 );
heatLookup[239] = new Color( 255, 248, 182 );
heatLookup[240] = new Color( 255, 249, 185 );
heatLookup[241] = new Color( 255, 252, 193 );
heatLookup[242] = new Color( 255, 253, 196 );
heatLookup[243] = new Color( 255, 255, 204 );
heatLookup[244] = new Color( 255, 255, 207 );
heatLookup[245] = new Color( 255, 255, 211 );
heatLookup[246] = new Color( 255, 255, 218 );
heatLookup[247] = new Color( 255, 255, 222 );
heatLookup[248] = new Color( 255, 255, 225 );
heatLookup[249] = new Color( 255, 255, 229 );
heatLookup[250] = new Color( 255, 255, 233 );
heatLookup[251] = new Color( 255, 255, 236 );
heatLookup[252] = new Color( 255, 255, 240 );
heatLookup[253] = new Color( 255, 255, 244 );
heatLookup[254] = new Color( 255, 255, 247 );
heatLookup[255] = new Color( 255, 255, 255 );