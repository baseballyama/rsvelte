import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Ribbons from '$lib/components/library/Animations/Ribbons/Ribbons.svelte';
import source from '$lib/components/library/Animations/Ribbons/Ribbons.svelte?raw';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Ribbons</h1> <!>`, 1);

export default function RibbonsDemo($$anchor) {
	const DEFAULTS = {
		baseThickness: 30,
		color: '#FF8A4C',
		speedMultiplier: 0.5,
		maxAge: 500,
		enableFade: false,
		enableShaderEffect: false
	};

	let baseThickness = $.state($.proxy(DEFAULTS.baseThickness));
	let color = $.state($.proxy(DEFAULTS.color));
	let speedMultiplier = $.state($.proxy(DEFAULTS.speedMultiplier));
	let maxAge = $.state($.proxy(DEFAULTS.maxAge));
	let enableFade = $.state($.proxy(DEFAULTS.enableFade));
	let enableShaderEffect = $.state($.proxy(DEFAULTS.enableShaderEffect));
	const hasChanges = $.derived(() => $.get(baseThickness) !== DEFAULTS.baseThickness || $.get(color) !== DEFAULTS.color || $.get(speedMultiplier) !== DEFAULTS.speedMultiplier || $.get(maxAge) !== DEFAULTS.maxAge || $.get(enableFade) !== DEFAULTS.enableFade || $.get(enableShaderEffect) !== DEFAULTS.enableShaderEffect);

	function reset() {
		$.set(baseThickness, DEFAULTS.baseThickness, true);
		$.set(color, DEFAULTS.color, true);
		$.set(speedMultiplier, DEFAULTS.speedMultiplier, true);
		$.set(maxAge, DEFAULTS.maxAge, true);
		$.set(enableFade, DEFAULTS.enableFade, true);
		$.set(enableShaderEffect, DEFAULTS.enableShaderEffect, true);
	}

	const colors = $.derived(() => [$.get(color)]);
	const usage = $.derived(() => `<Ribbons colors={['${$.get(color)}']} baseThickness={${$.get(baseThickness)}} speedMultiplier={${$.get(speedMultiplier)}} maxAge={${$.get(maxAge)}} enableFade={${$.get(enableFade)}} enableShaderEffect={${$.get(enableShaderEffect)}} />`);

	const props = [
		{
			name: 'colors',
			type: 'string[]',
			default: '["#ff9346", ...]',
			description: 'One color per ribbon.'
		},

		{
			name: 'baseSpring',
			type: 'number',
			default: '0.03',
			description: 'Spring stiffness baseline.'
		},

		{
			name: 'baseFriction',
			type: 'number',
			default: '0.9',
			description: 'Spring friction baseline.'
		},

		{
			name: 'baseThickness',
			type: 'number',
			default: '30',
			description: 'Ribbon thickness.'
		},

		{
			name: 'offsetFactor',
			type: 'number',
			default: '0.05',
			description: 'Vertical offset between ribbons.'
		},

		{
			name: 'maxAge',
			type: 'number',
			default: '500',
			description: 'Trail lifetime (ms).'
		},

		{
			name: 'pointCount',
			type: 'number',
			default: '50',
			description: 'Sample points along trail.'
		},

		{
			name: 'speedMultiplier',
			type: 'number',
			default: '0.6',
			description: 'Pointer-velocity multiplier.'
		},

		{
			name: 'enableFade',
			type: 'boolean',
			default: 'false',
			description: 'Fade ribbons by age.'
		},

		{
			name: 'enableShaderEffect',
			type: 'boolean',
			default: 'false',
			description: 'Apply iridescence shader.'
		},

		{
			name: 'effectAmplitude',
			type: 'number',
			default: '2',
			description: 'Shader displacement amplitude.'
		},

		{
			name: 'backgroundColor',
			type: 'number[]',
			default: '[0,0,0,0]',
			description: 'Clear color RGBA.'
		}
	];

	var fragment = root_2();

	$.head('1sewxv3', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Ribbons - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Ribbons(node_1, {
				get colors() {
					return $.get(colors);
				},

				get baseThickness() {
					return $.get(baseThickness);
				},

				get speedMultiplier() {
					return $.get(speedMultiplier);
				},

				get maxAge() {
					return $.get(maxAge);
				},

				get enableFade() {
					return $.get(enableFade);
				},

				get enableShaderEffect() {
					return $.get(enableShaderEffect);
				}
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'ribbons',
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

					PreviewColorPicker(node_2, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Base Thickness',
						min: 5,
						max: 100,
						step: 1,
						get value() {
							return $.get(baseThickness);
						},
						onChange: (v) => $.set(baseThickness, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Speed Multiplier',
						min: 0.1,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(speedMultiplier);
						},
						onChange: (v) => $.set(speedMultiplier, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Max Age',
						min: 100,
						max: 3000,
						step: 50,
						get value() {
							return $.get(maxAge);
						},
						valueUnit: 'ms',
						onChange: (v) => $.set(maxAge, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSwitch(node_6, {
						title: 'Enable Fade',
						get checked() {
							return $.get(enableFade);
						},
						onChange: (v) => $.set(enableFade, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Shader Effect',
						get checked() {
							return $.get(enableShaderEffect);
						},
						onChange: (v) => $.set(enableShaderEffect, v, true)
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
			componentName: 'Ribbons',
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