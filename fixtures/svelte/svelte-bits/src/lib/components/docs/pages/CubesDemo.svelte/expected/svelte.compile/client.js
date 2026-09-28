import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Cubes from '$lib/components/library/Animations/Cubes/Cubes.svelte';
import source from '$lib/components/library/Animations/Cubes/Cubes.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Cubes</h1> <!>`, 1);

export default function CubesDemo($$anchor) {
	const DEFAULTS = {
		borderStyle: '2px dashed #FF8A4C',
		gridSize: 8,
		maxAngle: 45,
		radius: 3,
		autoAnimate: true,
		rippleOnClick: true
	};

	let borderStyle = $.state($.proxy(DEFAULTS.borderStyle));
	let gridSize = $.state($.proxy(DEFAULTS.gridSize));
	let maxAngle = $.state($.proxy(DEFAULTS.maxAngle));
	let radius = $.state($.proxy(DEFAULTS.radius));
	let autoAnimate = $.state($.proxy(DEFAULTS.autoAnimate));
	let rippleOnClick = $.state($.proxy(DEFAULTS.rippleOnClick));
	const hasChanges = $.derived(() => $.get(borderStyle) !== DEFAULTS.borderStyle || $.get(gridSize) !== DEFAULTS.gridSize || $.get(maxAngle) !== DEFAULTS.maxAngle || $.get(radius) !== DEFAULTS.radius || $.get(autoAnimate) !== DEFAULTS.autoAnimate || $.get(rippleOnClick) !== DEFAULTS.rippleOnClick);

	function reset() {
		$.set(borderStyle, DEFAULTS.borderStyle, true);
		$.set(gridSize, DEFAULTS.gridSize, true);
		$.set(maxAngle, DEFAULTS.maxAngle, true);
		$.set(radius, DEFAULTS.radius, true);
		$.set(autoAnimate, DEFAULTS.autoAnimate, true);
		$.set(rippleOnClick, DEFAULTS.rippleOnClick, true);
	}

	const usage = $.derived(() => `<Cubes gridSize={${$.get(gridSize)}} maxAngle={${$.get(maxAngle)}} radius={${$.get(radius)}} borderStyle="${$.get(borderStyle)}" autoAnimate={${$.get(autoAnimate)}} rippleOnClick={${$.get(rippleOnClick)}} />`);

	const props = [
		{
			name: 'gridSize',
			type: 'number',
			default: '10',
			description: 'The size of the grid (cubes per row/column).'
		},

		{
			name: 'cubeSize',
			type: 'number',
			default: 'undefined',
			description: 'Fixed cube size in px. If undefined, cubes are responsive.'
		},

		{
			name: 'maxAngle',
			type: 'number',
			default: '45',
			description: 'Max rotation angle for the tilt effect.'
		},

		{
			name: 'radius',
			type: 'number',
			default: '3',
			description: 'Mouse hover radius in cube units.'
		},

		{
			name: 'borderStyle',
			type: 'string',
			default: '"2px dashed #B497CF"',
			description: 'CSS border applied to each cube face.'
		},

		{
			name: 'faceColor',
			type: 'string',
			default: '"#060010"',
			description: 'Background color of each cube face.'
		},

		{
			name: 'rippleColor',
			type: 'string',
			default: '"#fff"',
			description: 'Ripple highlight color on click.'
		},

		{
			name: 'rippleSpeed',
			type: 'number',
			default: '1.5',
			description: 'Speed multiplier of the ripple animation.'
		},

		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'true',
			description: 'Whether the cubes auto-orbit when idle.'
		},

		{
			name: 'rippleOnClick',
			type: 'boolean',
			default: 'true',
			description: 'Trigger a ripple wave when clicking a cube.'
		}
	];

	var fragment = root_2();

	$.head('1ihv5aa', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Cubes - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Cubes(node_1, {
				get gridSize() {
					return $.get(gridSize);
				},

				get maxAngle() {
					return $.get(maxAngle);
				},

				get radius() {
					return $.get(radius);
				},

				get borderStyle() {
					return $.get(borderStyle);
				},

				get autoAnimate() {
					return $.get(autoAnimate);
				},

				get rippleOnClick() {
					return $.get(rippleOnClick);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'cubes',
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
					var fragment_3 = root_1();
					var node_2 = $.first_child(fragment_3);

					PreviewSelect(node_2, {
						title: 'Border Style',
						get value() {
							return $.get(borderStyle);
						},

						options: [
							{ label: 'Dashed Orange', value: '2px dashed #FF8A4C' },
							{ label: 'Dotted White', value: '2px dotted #fff' },
							{ label: 'Solid White', value: '3px solid #fff' }
						],
						onChange: (v) => $.set(borderStyle, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Grid Size',
						min: 3,
						max: 15,
						step: 1,
						get value() {
							return $.get(gridSize);
						},
						onChange: (v) => $.set(gridSize, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Max Angle',
						min: 10,
						max: 90,
						step: 5,
						get value() {
							return $.get(maxAngle);
						},
						valueUnit: '°',
						onChange: (v) => $.set(maxAngle, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Radius',
						min: 1,
						max: 6,
						step: 1,
						get value() {
							return $.get(radius);
						},
						onChange: (v) => $.set(radius, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Auto Animate',
						get checked() {
							return $.get(autoAnimate);
						},
						onChange: (v) => $.set(autoAnimate, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Ripple On Click',
						get checked() {
							return $.get(rippleOnClick);
						},
						onChange: (v) => $.set(rippleOnClick, v, true)
					});

					$.append($$anchor, fragment_3);
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
			componentName: 'Cubes',
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