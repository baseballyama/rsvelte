import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import DotField from '$lib/components/library/Backgrounds/DotField/DotField.svelte';
import dotFieldSource from '$lib/components/library/Backgrounds/DotField/DotField.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-2xl bg-[#14110e]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Dot Field</h1> <!>`, 1);

export default function DotFieldDemo($$anchor) {
	const DEFAULTS = {
		dotRadius: 1.5,
		dotSpacing: 14,
		cursorRadius: 500,
		cursorForce: 0.1,
		bulgeOnly: true,
		bulgeStrength: 67,
		glowRadius: 160,
		sparkle: false,
		waveAmplitude: 0,
		gradientFrom: '#ff3e00',
		gradientTo: '#ffb089',
		glowColor: '#14110e'
	};

	let dotRadius = $.state($.proxy(DEFAULTS.dotRadius));
	let dotSpacing = $.state($.proxy(DEFAULTS.dotSpacing));
	let cursorRadius = $.state($.proxy(DEFAULTS.cursorRadius));
	let cursorForce = $.state($.proxy(DEFAULTS.cursorForce));
	let bulgeOnly = $.state($.proxy(DEFAULTS.bulgeOnly));
	let bulgeStrength = $.state($.proxy(DEFAULTS.bulgeStrength));
	let glowRadius = $.state($.proxy(DEFAULTS.glowRadius));
	let sparkle = $.state($.proxy(DEFAULTS.sparkle));
	let waveAmplitude = $.state($.proxy(DEFAULTS.waveAmplitude));
	let gradientFrom = $.state($.proxy(DEFAULTS.gradientFrom));
	let gradientTo = $.state($.proxy(DEFAULTS.gradientTo));
	let glowColor = $.state($.proxy(DEFAULTS.glowColor));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(dotRadius) !== DEFAULTS.dotRadius || $.get(dotSpacing) !== DEFAULTS.dotSpacing || $.get(cursorRadius) !== DEFAULTS.cursorRadius || $.get(cursorForce) !== DEFAULTS.cursorForce || $.get(bulgeOnly) !== DEFAULTS.bulgeOnly || $.get(bulgeStrength) !== DEFAULTS.bulgeStrength || $.get(glowRadius) !== DEFAULTS.glowRadius || $.get(sparkle) !== DEFAULTS.sparkle || $.get(waveAmplitude) !== DEFAULTS.waveAmplitude || $.get(gradientFrom) !== DEFAULTS.gradientFrom || $.get(gradientTo) !== DEFAULTS.gradientTo || $.get(glowColor) !== DEFAULTS.glowColor);

	function reset() {
		$.set(dotRadius, DEFAULTS.dotRadius, true);
		$.set(dotSpacing, DEFAULTS.dotSpacing, true);
		$.set(cursorRadius, DEFAULTS.cursorRadius, true);
		$.set(cursorForce, DEFAULTS.cursorForce, true);
		$.set(bulgeOnly, DEFAULTS.bulgeOnly, true);
		$.set(bulgeStrength, DEFAULTS.bulgeStrength, true);
		$.set(glowRadius, DEFAULTS.glowRadius, true);
		$.set(sparkle, DEFAULTS.sparkle, true);
		$.set(waveAmplitude, DEFAULTS.waveAmplitude, true);
		$.set(gradientFrom, DEFAULTS.gradientFrom, true);
		$.set(gradientTo, DEFAULTS.gradientTo, true);
		$.set(glowColor, DEFAULTS.glowColor, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import DotField from '$lib/components/DotField.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden;">
  <DotField
    dotRadius={${$.get(dotRadius)}}
    dotSpacing={${$.get(dotSpacing)}}
    cursorRadius={${$.get(cursorRadius)}}
    cursorForce={${$.get(cursorForce)}}
    bulgeOnly={${$.get(bulgeOnly)}}
    bulgeStrength={${$.get(bulgeStrength)}}
    glowRadius={${$.get(glowRadius)}}
    sparkle={${$.get(sparkle)}}
    waveAmplitude={${$.get(waveAmplitude)}}
    gradientFrom="${$.get(gradientFrom)}"
    gradientTo="${$.get(gradientTo)}"
    glowColor="${$.get(glowColor)}"
  />
</div>`);

	const props = [
		{
			name: 'dotRadius',
			type: 'number',
			default: '1.5',
			description: 'Radius of each individual dot in the grid.'
		},

		{
			name: 'dotSpacing',
			type: 'number',
			default: '14',
			description: 'Spacing between dots in the grid.'
		},

		{
			name: 'cursorRadius',
			type: 'number',
			default: '500',
			description: 'Radius of the cursor interaction area.'
		},

		{
			name: 'cursorForce',
			type: 'number',
			default: '0.1',
			description: 'Force applied to dots when not in bulge mode.'
		},

		{
			name: 'bulgeOnly',
			type: 'boolean',
			default: 'true',
			description: 'When true, dots bulge around the cursor. When false, dots are pushed with physics.'
		},

		{
			name: 'bulgeStrength',
			type: 'number',
			default: '67',
			description: 'Strength of the bulge effect around the cursor.'
		},

		{
			name: 'glowRadius',
			type: 'number',
			default: '160',
			description: 'Radius of the SVG glow effect that follows the cursor.'
		},

		{
			name: 'sparkle',
			type: 'boolean',
			default: 'false',
			description: 'When enabled, a small fraction of dots sparkle at a larger size.'
		},

		{
			name: 'waveAmplitude',
			type: 'number',
			default: '0',
			description: 'Amplitude of the wave displacement animation applied to dots.'
		},

		{
			name: 'gradientFrom',
			type: 'string',
			default: '"rgba(255, 62, 0, 0.35)"',
			description: 'Start color of the diagonal gradient applied to dots.'
		},

		{
			name: 'gradientTo',
			type: 'string',
			default: '"rgba(255, 176, 137, 0.25)"',
			description: 'End color of the diagonal gradient applied to dots.'
		},

		{
			name: 'glowColor',
			type: 'string',
			default: '"#14110E"',
			description: 'Color of the radial glow effect that follows the cursor.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root wrapper.'
		}
	];

	var fragment = root_2();

	$.head('111i6gj', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Dot Field - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			DotField(node_1, {
				get dotRadius() {
					return $.get(dotRadius);
				},

				get dotSpacing() {
					return $.get(dotSpacing);
				},

				get cursorRadius() {
					return $.get(cursorRadius);
				},

				get cursorForce() {
					return $.get(cursorForce);
				},

				get bulgeOnly() {
					return $.get(bulgeOnly);
				},

				get bulgeStrength() {
					return $.get(bulgeStrength);
				},

				get glowRadius() {
					return $.get(glowRadius);
				},

				get sparkle() {
					return $.get(sparkle);
				},

				get waveAmplitude() {
					return $.get(waveAmplitude);
				},

				get gradientFrom() {
					return $.get(gradientFrom);
				},

				get gradientTo() {
					return $.get(gradientTo);
				},

				get glowColor() {
					return $.get(glowColor);
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
				slug: 'dot-field',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return dotFieldSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					PreviewSlider(node_3, {
						title: 'Dot Radius',
						min: 0.5,
						max: 5,
						step: 0.5,
						get value() {
							return $.get(dotRadius);
						},
						onChange: (v) => $.set(dotRadius, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Dot Spacing',
						min: 5,
						max: 30,
						step: 1,
						get value() {
							return $.get(dotSpacing);
						},
						onChange: (v) => $.set(dotSpacing, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Cursor Radius',
						min: 100,
						max: 1000,
						step: 50,
						get value() {
							return $.get(cursorRadius);
						},
						onChange: (v) => $.set(cursorRadius, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Cursor Force',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(cursorForce);
						},
						onChange: (v) => $.set(cursorForce, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSwitch(node_7, {
						title: 'Bulge Only',
						get checked() {
							return $.get(bulgeOnly);
						},
						onChange: (v) => $.set(bulgeOnly, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Bulge Strength',
						min: 0,
						max: 150,
						step: 1,
						get value() {
							return $.get(bulgeStrength);
						},
						onChange: (v) => $.set(bulgeStrength, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Glow Radius',
						min: 50,
						max: 400,
						step: 10,
						get value() {
							return $.get(glowRadius);
						},
						onChange: (v) => $.set(glowRadius, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Wave Amplitude',
						min: 0,
						max: 20,
						step: 1,
						get value() {
							return $.get(waveAmplitude);
						},
						onChange: (v) => $.set(waveAmplitude, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSwitch(node_11, {
						title: 'Sparkle',
						get checked() {
							return $.get(sparkle);
						},
						onChange: (v) => $.set(sparkle, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewColorPicker(node_12, {
						title: 'Gradient From',
						get value() {
							return $.get(gradientFrom);
						},
						onChange: (v) => $.set(gradientFrom, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewColorPicker(node_13, {
						title: 'Gradient To',
						get value() {
							return $.get(gradientTo);
						},
						onChange: (v) => $.set(gradientTo, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewColorPicker(node_14, {
						title: 'Glow Color',
						get value() {
							return $.get(glowColor);
						},
						onChange: (v) => $.set(glowColor, v, true)
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
			componentName: 'DotField',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return dotFieldSource;
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