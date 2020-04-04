/* tslint:disable */
import PlotlyTransform, { PlotlyNullTransform } from '@nteract/transform-plotly';
import GeoJSONTransform from '@nteract/transform-geojson';

import ModelDebug from '@nteract/transform-model-debug';

import DataSource from './transform-datasource'

// todo transform-datasource may cause DOM parsing problem
// import DataResourceTransform from '@nteract/transform-dataresource';

// import { VegaLite1, VegaLite2, VegaLite3, Vega, Vega2, Vega3 } from '@nteract/transform-vega';

import { standardTransforms, standardDisplayOrder, registerTransform, richestMimetype } from '@nteract/transforms';

// todo const additionalTransforms = [DataResourceTransform, ModelDebug, PlotlyNullTransform, PlotlyTransform, GeoJSONTransform, VegaLite1, VegaLite2, VegaLite3, Vega, Vega2, Vega3];
const additionalTransforms = [DataSource, ModelDebug, PlotlyNullTransform, PlotlyTransform, GeoJSONTransform];

const { transforms, displayOrder } = additionalTransforms.reduce(registerTransform, {
    transforms: standardTransforms,
    displayOrder: standardDisplayOrder
});

export { displayOrder, transforms, richestMimetype, registerTransform };
