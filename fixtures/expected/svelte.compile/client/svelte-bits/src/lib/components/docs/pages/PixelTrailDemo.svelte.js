import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import PixelTrail from '$lib/components/library/Animations/PixelTrail/PixelTrail.svelte';
import source from '$lib/components/library/Animations/PixelTrail/PixelTrail.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Pixel Trail</h1> <!>`, 1);

export default function PixelTrailDemo($$anchor) {
	const DEFAULTS = {
		gridSize: 50,
		trailSize: 0.1,
		maxAge: 250,
		interpolate: 5,
		color: '#FF8A4C',
		gooeyEnabled: true,
		gooStrength: 2
	};

	let gridSize = $.state($.proxy(DEFAULTS.gridSize));
	let trailSize = $.state($.proxy(DEFAULTS.trailSize));
	let maxAge = $.state($.proxy(DEFAULTS.maxAge));
	let interpolate = $.state($.proxy(DEFAULTS.interpolate));
	let color = $.state($.proxy(DEFAULTS.color));
	let gooeyEnabled = $.state($.proxy(DEFAULTS.gooeyEnabled));
	let gooStrength = $.state($.proxy(DEFAULTS.gooStrength));

	const gooeyFilter = $.derived(() => $.get(gooeyEnabled)
		? { id: 'pixel-trail-goo', strength: $.get(gooStrength) }
		: undefined);

	const hasChanges = $.derived(() => $.get(gridSize) !== DEFAULTS.gridSize || $.get(trailSize) !== DEFAULTS.trailSize || $.get(maxAge) !== DEFAULTS.maxAge || $.get(interpolate) !== DEFAULTS.interpolate || $.get(color) !== DEFAULTS.color || $.get(gooeyEnabled) !== DEFAULTS.gooeyEnabled || $.get(gooStrength) !== DEFAULTS.gooStrength);

	function reset() {
		$.set(gridSize, DEFAULTS.gridSize, true);
		$.set(trailSize, DEFAULTS.trailSize, true);
		$.set(maxAge, DEFAULTS.maxAge, true);
		$.set(interpolate, DEFAULTS.interpolate, true);
		$.set(color, DEFAULTS.color, true);
		$.set(gooeyEnabled, DEFAULTS.gooeyEnabled, true);
		$.set(gooStrength, DEFAULTS.gooStrength, true);
	}

	const usage = $.derived(() => `<PixelTrail gridSize={${$.get(gridSize)}} trailSize={${$.get(trailSize)}} maxAge={${$.get(maxAge)}} interpolate={${$.get(interpolate)}} color="${$.get(color)}" gooeyEnabled={${$.get(gooeyEnabled)}} gooStrength={${$.get(gooStrength)}} />`);

	const props = [
		{
			name: 'gridSize',
			type: 'number',
			default: '40',
			description: 'Grid resolution (cells per axis).'
		},

		{
			name: 'trailSize',
			type: 'number',
			default: '0.1',
			description: 'Trail brush size in grid units.'
		},

		{
			name: 'maxAge',
			type: 'number',
			default: '250',
			description: 'Trail lifetime in milliseconds.'
		},

		{
			name: 'interpolate',
			type: 'number',
			default: '5',
			description: 'Interpolation density between cursor samples.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#ffffff"',
			description: 'Trail color.'
		},

		{
			name: 'gooeyEnabled',
			type: 'boolean',
			default: 'true',
			description: 'Enable SVG goo filter.'
		},

		{
			name: 'gooStrength',
			type: 'number',
			default: '2',
			description: 'Goo blur intensity.'
		}
	];

	var fragment = root_2();

	$.head('1dewshm', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Pixel Trail - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(gridSize), ($$anchor) => {
				PixelTrail($$anchor, {
					get gridSize() {
						return $.get(gridSize);
					},

					get trailSize() {
						return $.get(trailSize);
					},

					get maxAge() {
						return $.get(maxAge);
					},

					get interpolate() {
						return $.get(interpolate);
					},

					get color() {
						return $.get(color);
					},

					get gooeyFilter() {
						return $.get(gooeyFilter);
					}
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'pixel-trail',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return source;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_2 = $.first_child(fragment_4);

					PreviewColorPicker(node_2, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Grid Size',
						min: 10,
						max: 120,
						step: 1,
						get value() {
							return $.get(gridSize);
						},
						onChange: (v) => $.set(gridSize, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Trail Size',
						min: 0.01,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(trailSize);
						},
						onChange: (v) => $.set(trailSize, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Max Age',
						min: 50,
						max: 2000,
						step: 50,
						get value() {
							return $.get(maxAge);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(maxAge, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Interpolate',
						min: 0,
						max: 20,
						step: 1,
						get value() {
							return $.get(interpolate);
						},
						onChange: (v) => $.set(interpolate, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Goo Strength',
						min: 0,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(gooStrength);
						},
						onChange: (v) => $.set(gooStrength, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSwitch(node_8, {
						title: 'Gooey Enabled',
						get checked() {
							return $.get(gooeyEnabled);
						},
						onChange: (v) => $.set(gooeyEnabled, v, true)
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		};

		const propTable = ($$anchor) => {
			PropTable($$anchor, {
				get rows() {
					return props;
				}
			});
		};

		TabsLayout(node, {
			onreset: reset,
			get hasChanges() {
				return $.get(hasChanges);
			},
			componentName: 'PixelTrail',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return source;
			},

			get props() {
				return props;
			},
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$.append($$anchor, fragment);
}