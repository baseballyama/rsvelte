import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SelectField, Switch } from 'svelte-ux';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'doubleScale',
	'serviceUrl'
]);

var root = $.from_html(`<div slot="append" role="none"><div class="text-[10px] text-surface-content/50 text-center">2x</div> <!></div>`);
var root_1 = $.from_html(`<div><!></div>`);

export default function GeoTileControls($$anchor, $$props) {
	$.push($$props, true);

	let doubleScale = $.prop($$props, 'doubleScale', 15, devicePixelRatio > 1),
		serviceUrl = $.prop($$props, 'serviceUrl', 15),
		restProps = $.rest_props($$props, rest_excludes);

	// <TilesetField bind:doubleScale bind:serviceUrl />
	// TODO: Access via context, or possibly global state
	const ACCESS_TOKEN = 'pk.eyJ1IjoidGVjaG5pcTM1IiwiYSI6ImNsZTR5cDd0ZjAyNm8zdnFvczhzdnFpcXkifQ.-LAr8sl5BZ3y-H0pDyD1qA';

	// https://docs.mapbox.com/api/maps/styles/
	const mapboxv1 = $.derived(() => (style) => (x, y, z) => {
		return `https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/${z}/${x}/${y}${doubleScale() ? '@2x' : ''}?access_token=${ACCESS_TOKEN}`;
	});

	// https://docs.mapbox.com/api/maps/raster-tiles/
	// https://docs.mapbox.com/data/tilesets/reference/mapbox-streets-v8/
	const mapboxv4 = $.derived(() => (tileset) => (x, y, z) => {
		return `https://${('abc')[Math.abs(x + y) % 3]}.tiles.mapbox.com/v4/${tileset}/${z}/${x}/${y}${doubleScale() ? '@2x' : ''}.png?access_token=${ACCESS_TOKEN}`;
	});

	// https://apps.nationalmap.gov/services/
	const nationalmap = (tileset) => (x, y, z) => {
		return `https://basemap.nationalmap.gov/arcgis/rest/services/${tileset}/MapServer/tile/${z}/${y}/${x}`;
	};

	// https://services.arcgisonline.com/arcgis/rest/services
	// https://www.arcgis.com/home/webmap/viewer.html?useExisting=1
	// https://www.arcgis.com/apps/mapviewer/index.html
	const arcgis = (tileset) => (x, y, z) => {
		return `https://services.arcgisonline.com/ArcGIS/rest/services/${tileset}/MapServer/tile/${z}/${y}/${x}`;
	};

	const arcgisVector = (tileset) => (x, y, z) => {
		return `https://basemaps.arcgis.com/arcgis/rest/services/${tileset}/VectorTileServer/tile/${z}/${y}/${x}.pbf`;

		// https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/12/1572/1108.pbf
	};

	// https://github.com/leaflet-extras/leaflet-providers/blob/master/leaflet-providers.js#L79
	// https://www.openstreetmap.org/
	const openStreetMap = (tileset) => (x, y, z) => {
		// CyclOSM:  https://a.tile-cyclosm.openstreetmap.fr/cyclosm/9/142/197.png
		// Cycle Map: https://b.tile.thunderforest.com/cycle/9/141/199@2x.png?apikey=6e5478c8a4f54c779f85573c0e399391
		// TransportMap: https://b.tile.thunderforest.com/transport/9/136/195@2x.png?apikey=6e5478c8a4f54c779f85573c0e399391
		return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
	};

	// opentopomap.org/
	const openTopoMap = (tileset) => (x, y, z) => {
		const s = 'a';

		return `https://${s}.tile.opentopomap.org/${z}/${x}/${y}.png`;
	};

	const services = $.derived(() => ({
		'mapbox v1': {
			'streets-v11': $.get(mapboxv1)('streets-v11'),
			'light-v10': $.get(mapboxv1)('light-v10'),
			'dark-v10': $.get(mapboxv1)('dark-v10'),
			'outdoors-v12': $.get(mapboxv1)('outdoors-v12'),
			'satelllite-v9': $.get(mapboxv1)('satellite-v9'),
			'satelllite-streets-v12': $.get(mapboxv1)('satellite-streets-v12'),
			'navigation-day-v1': $.get(mapboxv1)('navigation-day-v1'),
			'navigation-night-v1': $.get(mapboxv1)('navigation-night-v1')
		},
		'mapbox v4': {
			'natural-earth-2': $.get(mapboxv4)('mapbox.natural-earth-2'),
			satellite: $.get(mapboxv4)('mapbox.satellite'),
			streets: $.get(mapboxv4)('mapbox.mapbox-streets-v8'),
			terrain: $.get(mapboxv4)('mapbox.mapbox-terrain-v2'),
			'terrain-dem': $.get(mapboxv4)('mapbox.mapbox-terrain-dem-v1'),
			traffic: $.get(mapboxv4)('mapbox.mapbox-traffic-v1')

			// 'transit (mapbox v4)': mapboxv4('mapbox.transit-v2'),
		},
		OpenStreetMap: { Stardard: openStreetMap('') },
		OpenTopoMap: { Stardard: openTopoMap('') },
		'National Map Services': {
			Hydrography: nationalmap('USGSHydroCached'),
			'USGS Imagery Topo Base Map': nationalmap('USGSImageryTopo'),
			'USGS Imagery Only Base Map': nationalmap('USGSImageryOnly'),
			'USGS Shaded Relief': nationalmap('USGSShadedReliefOnly'),
			'USGS Topo Base Map': nationalmap('USGSTopo')
		},
		ArcGIS: {
			'USA Topo Map': arcgis('USA_Topo_Maps'),
			'National Geographic World Map': arcgis('NatGeo_World_Map'),
			'World Imagery': arcgis('World_Imagery'),
			'World Physicial Map': arcgis('World_Physical_Map'),
			'World Shaded Relief': arcgis('World_Shaded_Relief'),
			'World Street Map': arcgis('World_Street_Map'),
			'World Terrain Base': arcgis('World_Terrain_Base'),
			'World Topo Map': arcgis('World_Topo_Map')
		}

		// 'ArcGIS Vector': {
		// 	 'Community Map', url: arcgisVector('World_Basemap_v2'),
		// }
	}));

	const serviceOptions = $.derived(() => Object.entries($.get(services)).flatMap(([group, service]) => {
		return Object.entries(service).map(([label, value]) => {
			return { label, value: `${group}:${label}`, group, serviceUrl: value };
		});
	}));

	const getServiceUrl = $.derived(() => (option) => {
		const [selectedService, selectedTileset] = $.get(selected).split(':');

		return $.get(services)[selectedService][selectedTileset];
	});

	let selected = $.state('mapbox v1:streets-v11');

	$.user_effect(() => {
		serviceUrl($.get(getServiceUrl)($.get(selected)));
	});

	var div = root_1();

	$.attribute_effect(div, () => ({ class: 'screenshot-hidden', ...restProps }));

	var node = $.child(div);

	SelectField(node, {
		label: 'Tileset',
		get options() {
			return $.get(serviceOptions);
		},
		clearable: false,
		toggleIcon: null,
		stepper: true,
		get value() {
			return $.get(selected);
		},

		set value($$value) {
			$.set(selected, $$value, true);
		},

		$$slots: {
			append: ($$anchor, $$slotProps) => {
				var div_1 = root();
				var node_1 = $.sibling($.child(div_1), 2);

				Switch(node_1, {
					size: 'md',
					get checked() {
						return doubleScale();
					},

					set checked($$value) {
						doubleScale($$value);
					}
				});

				$.reset(div_1);
				$.delegated('click', div_1, (e) => e.stopPropagation());
				$.append($$anchor, div_1);
			}
		}
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);