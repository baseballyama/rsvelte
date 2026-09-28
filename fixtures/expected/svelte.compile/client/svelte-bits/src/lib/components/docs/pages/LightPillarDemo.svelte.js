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
import LightPillar from '$lib/components/library/Backgrounds/LightPillar/LightPillar.svelte';
import source from '$lib/components/library/Backgrounds/LightPillar/LightPillar.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Light Pillar</h1> <!>`, 1);

export default function LightPillarDemo($$anchor) {
	const D = {
		topColor: '#ff8a3d',
		bottomColor: '#FFB089',
		intensity: 1,
		rotationSpeed: 0.3,
		interactive: false,
		glowAmount: 0.005,
		pillarWidth: 3,
		pillarHeight: 0.4,
		noiseIntensity: 0.5,
		pillarRotation: 0
	};

	let topColor = $.state($.proxy(D.topColor));
	let bottomColor = $.state($.proxy(D.bottomColor));
	let intensity = $.state($.proxy(D.intensity));
	let rotationSpeed = $.state($.proxy(D.rotationSpeed));
	let interactive = $.state($.proxy(D.interactive));
	let glowAmount = $.state($.proxy(D.glowAmount));
	let pillarWidth = $.state($.proxy(D.pillarWidth));
	let pillarHeight = $.state($.proxy(D.pillarHeight));
	let noiseIntensity = $.state($.proxy(D.noiseIntensity));
	let pillarRotation = $.state($.proxy(D.pillarRotation));
	let showContent = $.state(true);
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(topColor) !== D.topColor || $.get(bottomColor) !== D.bottomColor || $.get(intensity) !== D.intensity || $.get(rotationSpeed) !== D.rotationSpeed || $.get(interactive) !== D.interactive || $.get(glowAmount) !== D.glowAmount || $.get(pillarWidth) !== D.pillarWidth || $.get(pillarHeight) !== D.pillarHeight || $.get(noiseIntensity) !== D.noiseIntensity || $.get(pillarRotation) !== D.pillarRotation);

	function reset() {
		$.set(topColor, D.topColor, true);
		$.set(bottomColor, D.bottomColor, true);
		$.set(intensity, D.intensity, true);
		$.set(rotationSpeed, D.rotationSpeed, true);
		$.set(interactive, D.interactive, true);
		$.set(glowAmount, D.glowAmount, true);
		$.set(pillarWidth, D.pillarWidth, true);
		$.set(pillarHeight, D.pillarHeight, true);
		$.set(noiseIntensity, D.noiseIntensity, true);
		$.set(pillarRotation, D.pillarRotation, true);
	}

	const usage = $.derived(() => `${sO}
  import LightPillar from '$lib/components/LightPillar.svelte';
${sC}

<div style="position: relative; width: 100%; height: 600px; background: #14110E;">
  <LightPillar topColor="${$.get(topColor)}" bottomColor="${$.get(bottomColor)}" />
</div>`);

	const props = [
		{
			name: 'topColor',
			type: 'string',
			default: "'#FF8A4C'",
			description: 'Top gradient color.'
		},

		{
			name: 'bottomColor',
			type: 'string',
			default: "'#FF9FFC'",
			description: 'Bottom gradient color.'
		},

		{
			name: 'intensity',
			type: 'number',
			default: '1',
			description: 'Output multiplier.'
		},

		{
			name: 'rotationSpeed',
			type: 'number',
			default: '0.3',
			description: 'Time/rotation speed.'
		},

		{
			name: 'interactive',
			type: 'boolean',
			default: 'false',
			description: 'Mouse-controlled rotation.'
		},

		{
			name: 'glowAmount',
			type: 'number',
			default: '0.005',
			description: 'Glow strength.'
		},

		{
			name: 'pillarWidth',
			type: 'number',
			default: '3',
			description: 'Radial bound.'
		},

		{
			name: 'pillarHeight',
			type: 'number',
			default: '0.4',
			description: 'Y scaling.'
		},

		{
			name: 'noiseIntensity',
			type: 'number',
			default: '0.5',
			description: 'Grain amount.'
		},

		{
			name: 'pillarRotation',
			type: 'number',
			default: '0',
			description: 'UV rotation (deg).'
		},

		{
			name: 'mixBlendMode',
			type: 'string',
			default: "'screen'",
			description: 'CSS mix-blend-mode.'
		},

		{
			name: 'quality',
			type: "'low'|'medium'|'high'",
			default: "'high'",
			description: 'Render quality.'
		}
	];

	var fragment = root_2();

	$.head('ob7nck', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Light Pillar - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			LightPillar(node_1, {
				get topColor() {
					return $.get(topColor);
				},

				get bottomColor() {
					return $.get(bottomColor);
				},

				get intensity() {
					return $.get(intensity);
				},

				get rotationSpeed() {
					return $.get(rotationSpeed);
				},

				get interactive() {
					return $.get(interactive);
				},

				get glowAmount() {
					return $.get(glowAmount);
				},

				get pillarWidth() {
					return $.get(pillarWidth);
				},

				get pillarHeight() {
					return $.get(pillarHeight);
				},

				get noiseIntensity() {
					return $.get(noiseIntensity);
				},

				get pillarRotation() {
					return $.get(pillarRotation);
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
				slug: 'light-pillar',
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
						title: 'Top Color',
						get value() {
							return $.get(topColor);
						},
						onChange: (v) => $.set(topColor, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewColorPicker(node_4, {
						title: 'Bottom Color',
						get value() {
							return $.get(bottomColor);
						},
						onChange: (v) => $.set(bottomColor, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Intensity',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(intensity);
						},
						onChange: (v) => $.set(intensity, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Rotation Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(rotationSpeed);
						},
						onChange: (v) => $.set(rotationSpeed, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Glow Amount',
						min: 0.001,
						max: 0.05,
						step: 0.001,
						get value() {
							return $.get(glowAmount);
						},
						onChange: (v) => $.set(glowAmount, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Pillar Width',
						min: 0.5,
						max: 6,
						step: 0.1,
						get value() {
							return $.get(pillarWidth);
						},
						onChange: (v) => $.set(pillarWidth, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Pillar Height',
						min: 0.1,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(pillarHeight);
						},
						onChange: (v) => $.set(pillarHeight, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Noise Intensity',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(noiseIntensity);
						},
						onChange: (v) => $.set(noiseIntensity, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Pillar Rotation',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(pillarRotation);
						},
						onChange: (v) => $.set(pillarRotation, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSwitch(node_12, {
						title: 'Interactive',
						get checked() {
							return $.get(interactive);
						},
						onChange: (v) => $.set(interactive, v, true)
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
			componentName: 'LightPillar',
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