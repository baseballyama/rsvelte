import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import ColorBends from '$lib/components/library/Backgrounds/ColorBends/ColorBends.svelte';
import colorBendsSource from '$lib/components/library/Backgrounds/ColorBends/ColorBends.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-2xl bg-[#14110e]"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Color Bends</h1> <!>`, 1);

export default function ColorBendsDemo($$anchor) {
	const DEFAULTS = {
		rotation: 90,
		autoRotate: 0,
		speed: 0.2,
		scale: 1,
		frequency: 1,
		warpStrength: 1,
		mouseInfluence: 1,
		parallax: 0.5,
		noise: 0.15,
		iterations: 1,
		intensity: 1.5,
		bandWidth: 6,
		color: '#ff3e00'
	};

	let rotation = $.state($.proxy(DEFAULTS.rotation));
	let autoRotate = $.state($.proxy(DEFAULTS.autoRotate));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let scale = $.state($.proxy(DEFAULTS.scale));
	let frequency = $.state($.proxy(DEFAULTS.frequency));
	let warpStrength = $.state($.proxy(DEFAULTS.warpStrength));
	let mouseInfluence = $.state($.proxy(DEFAULTS.mouseInfluence));
	let parallax = $.state($.proxy(DEFAULTS.parallax));
	let noise = $.state($.proxy(DEFAULTS.noise));
	let iterations = $.state($.proxy(DEFAULTS.iterations));
	let intensity = $.state($.proxy(DEFAULTS.intensity));
	let bandWidth = $.state($.proxy(DEFAULTS.bandWidth));
	let color = $.state($.proxy(DEFAULTS.color));
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(rotation) !== DEFAULTS.rotation || $.get(autoRotate) !== DEFAULTS.autoRotate || $.get(speed) !== DEFAULTS.speed || $.get(scale) !== DEFAULTS.scale || $.get(frequency) !== DEFAULTS.frequency || $.get(warpStrength) !== DEFAULTS.warpStrength || $.get(mouseInfluence) !== DEFAULTS.mouseInfluence || $.get(parallax) !== DEFAULTS.parallax || $.get(noise) !== DEFAULTS.noise || $.get(iterations) !== DEFAULTS.iterations || $.get(intensity) !== DEFAULTS.intensity || $.get(bandWidth) !== DEFAULTS.bandWidth || $.get(color) !== DEFAULTS.color);

	function reset() {
		$.set(rotation, DEFAULTS.rotation, true);
		$.set(autoRotate, DEFAULTS.autoRotate, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(scale, DEFAULTS.scale, true);
		$.set(frequency, DEFAULTS.frequency, true);
		$.set(warpStrength, DEFAULTS.warpStrength, true);
		$.set(mouseInfluence, DEFAULTS.mouseInfluence, true);
		$.set(parallax, DEFAULTS.parallax, true);
		$.set(noise, DEFAULTS.noise, true);
		$.set(iterations, DEFAULTS.iterations, true);
		$.set(intensity, DEFAULTS.intensity, true);
		$.set(bandWidth, DEFAULTS.bandWidth, true);
		$.set(color, DEFAULTS.color, true);
	}

	const usage = $.derived(() => `${scriptOpen}
  import ColorBends from '$lib/components/ColorBends.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden;">
  <ColorBends
    rotation={${$.get(rotation)}}
    autoRotate={${$.get(autoRotate)}}
    speed={${$.get(speed)}}
    scale={${$.get(scale)}}
    frequency={${$.get(frequency)}}
    warpStrength={${$.get(warpStrength)}}
    mouseInfluence={${$.get(mouseInfluence)}}
    parallax={${$.get(parallax)}}
    noise={${$.get(noise)}}
    iterations={${$.get(iterations)}}
    intensity={${$.get(intensity)}}
    bandWidth={${$.get(bandWidth)}}
    colors={["${$.get(color)}"]}
  />
</div>`);

	const props = [
		{
			name: 'rotation',
			type: 'number',
			default: '90',
			description: 'Base rotation angle in degrees.'
		},

		{
			name: 'autoRotate',
			type: 'number',
			default: '0',
			description: 'Automatic rotation speed in degrees per second.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.2',
			description: 'Animation time scale of the shader.'
		},

		{
			name: 'colors',
			type: 'string[]',
			default: '[]',
			description: 'Palette of up to 8 hex colors used to blend the bends.'
		},

		{
			name: 'transparent',
			type: 'boolean',
			default: 'true',
			description: 'Whether the background is transparent and uses alpha.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Zoom factor of the pattern.'
		},

		{
			name: 'frequency',
			type: 'number',
			default: '1',
			description: 'Wave frequency used in the pattern.'
		},

		{
			name: 'warpStrength',
			type: 'number',
			default: '1',
			description: 'Amount of warping and distortion applied to waves.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '1',
			description: 'How strongly the waves react to pointer movement.'
		},

		{
			name: 'parallax',
			type: 'number',
			default: '0.5',
			description: 'Parallax factor shifting content with the pointer.'
		},

		{
			name: 'noise',
			type: 'number',
			default: '0.15',
			description: 'Adds subtle grain. 0 disables noise.'
		},

		{
			name: 'iterations',
			type: 'number',
			default: '1',
			description: 'Number of extra warp passes, from 1 to 5.'
		},

		{
			name: 'intensity',
			type: 'number',
			default: '1.5',
			description: 'Brightness multiplier for the final color output.'
		},

		{
			name: 'bandWidth',
			type: 'number',
			default: '6',
			description: 'Controls the width and falloff of each color band.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root container.'
		}
	];

	var fragment = root_2();

	$.head('iqc7mf', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Color Bends - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			{
				let $0 = $.derived(() => [$.get(color)]);

				ColorBends(node_1, {
					get rotation() {
						return $.get(rotation);
					},

					get autoRotate() {
						return $.get(autoRotate);
					},

					get speed() {
						return $.get(speed);
					},

					get scale() {
						return $.get(scale);
					},

					get frequency() {
						return $.get(frequency);
					},

					get warpStrength() {
						return $.get(warpStrength);
					},

					get mouseInfluence() {
						return $.get(mouseInfluence);
					},

					get parallax() {
						return $.get(parallax);
					},

					get noise() {
						return $.get(noise);
					},

					get iterations() {
						return $.get(iterations);
					},

					get intensity() {
						return $.get(intensity);
					},

					get bandWidth() {
						return $.get(bandWidth);
					},

					get colors() {
						return $.get($0);
					}
				});
			}

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
				slug: 'color-bends',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return colorBendsSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_1();
					var node_3 = $.first_child(fragment_3);

					PreviewColorPicker(node_3, {
						title: 'Color',
						get value() {
							return $.get(color);
						},
						onChange: (v) => $.set(color, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Rotation (deg)',
						min: -180,
						max: 180,
						step: 1,
						get value() {
							return $.get(rotation);
						},
						onChange: (v) => $.set(rotation, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Auto Rotate (deg/s)',
						min: -5,
						max: 5,
						step: 1,
						get value() {
							return $.get(autoRotate);
						},
						onChange: (v) => $.set(autoRotate, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Speed',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Scale',
						min: 0.2,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Frequency',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(frequency);
						},
						onChange: (v) => $.set(frequency, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Warp Strength',
						min: 0.9,
						max: 1,
						step: 0.005,
						get value() {
							return $.get(warpStrength);
						},
						onChange: (v) => $.set(warpStrength, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Mouse Influence',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(mouseInfluence);
						},
						onChange: (v) => $.set(mouseInfluence, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Parallax',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(parallax);
						},
						onChange: (v) => $.set(parallax, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Noise',
						min: 0,
						max: 1,
						step: 0.01,
						get value() {
							return $.get(noise);
						},
						onChange: (v) => $.set(noise, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Iterations',
						min: 1,
						max: 5,
						step: 1,
						get value() {
							return $.get(iterations);
						},
						onChange: (v) => $.set(iterations, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Intensity',
						min: 0.1,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(intensity);
						},
						onChange: (v) => $.set(intensity, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					PreviewSlider(node_15, {
						title: 'Band Width',
						min: 1,
						max: 20,
						step: 0.5,
						get value() {
							return $.get(bandWidth);
						},
						onChange: (v) => $.set(bandWidth, v, true)
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
			componentName: 'ColorBends',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return colorBendsSource;
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