import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Aurora from '$lib/components/library/Backgrounds/Aurora/Aurora.svelte';
import source from '$lib/components/library/Backgrounds/Aurora/Aurora.svelte?raw';

var root = $.from_html(`<div style="position:relative;width:100%;height:400px;border-radius:14px;overflow:hidden;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Aurora</h1> <!>`, 1);

export default function AuroraDemo($$anchor) {
	const DEFAULTS = {
		color1: '#FF3E00',
		color2: '#FF8A4C',
		color3: '#FFB089',
		amplitude: 1,
		blend: 0.5,
		speed: 1
	};

	let color1 = $.state($.proxy(DEFAULTS.color1));
	let color2 = $.state($.proxy(DEFAULTS.color2));
	let color3 = $.state($.proxy(DEFAULTS.color3));
	let amplitude = $.state($.proxy(DEFAULTS.amplitude));
	let blend = $.state($.proxy(DEFAULTS.blend));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const colorStops = $.derived(() => [$.get(color1), $.get(color2), $.get(color3)]);
	const hasChanges = $.derived(() => $.get(color1) !== DEFAULTS.color1 || $.get(color2) !== DEFAULTS.color2 || $.get(color3) !== DEFAULTS.color3 || $.get(amplitude) !== DEFAULTS.amplitude || $.get(blend) !== DEFAULTS.blend || $.get(speed) !== DEFAULTS.speed);

	function reset() {
		$.set(color1, DEFAULTS.color1, true);
		$.set(color2, DEFAULTS.color2, true);
		$.set(color3, DEFAULTS.color3, true);
		$.set(amplitude, DEFAULTS.amplitude, true);
		$.set(blend, DEFAULTS.blend, true);
		$.set(speed, DEFAULTS.speed, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import Aurora from '$lib/components/Aurora.svelte';
${scriptClose}

<Aurora
  colorStops={["${$.get(color1)}", "${$.get(color2)}", "${$.get(color3)}"]}
  amplitude={${$.get(amplitude)}}
  blend={${$.get(blend)}}
  speed={${$.get(speed)}}
/>`);

	const props = [
		{
			name: 'colorStops',
			type: 'string[]',
			default: '["#FF3E00", "#FF8A4C", "#FFB089"]',
			description: 'Gradient color stops.'
		},

		{
			name: 'amplitude',
			type: 'number',
			default: '1',
			description: 'Strength of the blur halo (0–2).'
		},

		{
			name: 'blend',
			type: 'number',
			default: '0.5',
			description: 'Overall opacity / blend factor.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.'
		}
	];

	var fragment = root_2();

	$.head('4d8b6u', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Aurora - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			Aurora(node_1, {
				get colorStops() {
					return $.get(colorStops);
				},

				get amplitude() {
					return $.get(amplitude);
				},

				get blend() {
					return $.get(blend);
				},

				get speed() {
					return $.get(speed);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'aurora',
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
					var node_3 = $.first_child(fragment_3);

					PreviewColorPicker(node_3, {
						title: 'Color 1',
						get value() {
							return $.get(color1);
						},
						onChange: (v) => $.set(color1, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Color 2',
						get value() {
							return $.get(color2);
						},
						onChange: (v) => $.set(color2, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewColorPicker(node_5, {
						title: 'Color 3',
						get value() {
							return $.get(color3);
						},
						onChange: (v) => $.set(color3, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Amplitude',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(amplitude);
						},
						onChange: (v) => $.set(amplitude, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Blend',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(blend);
						},
						onChange: (v) => $.set(blend, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Speed',
						min: 0.1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(speed);
						},
						valueUnit: 'x',
						onChange: (v) => $.set(speed, v, true)
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
			componentName: 'Aurora',
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