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
import FaultyTerminal from '$lib/components/library/Backgrounds/FaultyTerminal/FaultyTerminal.svelte';
import faultyTerminalSource from '$lib/components/library/Backgrounds/FaultyTerminal/FaultyTerminal.svelte?raw';

var root = $.from_html(`<div class="relative h-[500px] w-full overflow-hidden rounded-2xl"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Faulty Terminal</h1> <!>`, 1);

export default function FaultyTerminalDemo($$anchor) {
	const DEFAULTS = {
		scale: 1.5,
		digitSize: 1.2,
		timeScale: 0.5,
		scanlineIntensity: 0.5,
		curvature: 0.1,
		tint: '#FF8A4C',
		mouseReact: true,
		mouseStrength: 0.5,
		pageLoadAnimation: true,
		noiseAmp: 1,
		brightness: 0.6
	};

	let scale = $.state($.proxy(DEFAULTS.scale));
	let digitSize = $.state($.proxy(DEFAULTS.digitSize));
	let timeScale = $.state($.proxy(DEFAULTS.timeScale));
	let scanlineIntensity = $.state($.proxy(DEFAULTS.scanlineIntensity));
	let curvature = $.state($.proxy(DEFAULTS.curvature));
	let tint = $.state($.proxy(DEFAULTS.tint));
	let mouseReact = $.state($.proxy(DEFAULTS.mouseReact));
	let mouseStrength = $.state($.proxy(DEFAULTS.mouseStrength));
	let pageLoadAnimation = $.state($.proxy(DEFAULTS.pageLoadAnimation));
	let noiseAmp = $.state($.proxy(DEFAULTS.noiseAmp));
	let brightness = $.state($.proxy(DEFAULTS.brightness));
	let renderKey = $.state(0);
	let showContent = $.state(true);
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => $.get(scale) !== DEFAULTS.scale || $.get(digitSize) !== DEFAULTS.digitSize || $.get(timeScale) !== DEFAULTS.timeScale || $.get(scanlineIntensity) !== DEFAULTS.scanlineIntensity || $.get(curvature) !== DEFAULTS.curvature || $.get(tint) !== DEFAULTS.tint || $.get(mouseReact) !== DEFAULTS.mouseReact || $.get(mouseStrength) !== DEFAULTS.mouseStrength || $.get(pageLoadAnimation) !== DEFAULTS.pageLoadAnimation || $.get(noiseAmp) !== DEFAULTS.noiseAmp || $.get(brightness) !== DEFAULTS.brightness);

	function reset() {
		$.set(scale, DEFAULTS.scale, true);
		$.set(digitSize, DEFAULTS.digitSize, true);
		$.set(timeScale, DEFAULTS.timeScale, true);
		$.set(scanlineIntensity, DEFAULTS.scanlineIntensity, true);
		$.set(curvature, DEFAULTS.curvature, true);
		$.set(tint, DEFAULTS.tint, true);
		$.set(mouseReact, DEFAULTS.mouseReact, true);
		$.set(mouseStrength, DEFAULTS.mouseStrength, true);
		$.set(pageLoadAnimation, DEFAULTS.pageLoadAnimation, true);
		$.set(noiseAmp, DEFAULTS.noiseAmp, true);
		$.set(brightness, DEFAULTS.brightness, true);
		$.set(renderKey, $.get(renderKey) + 1);
	}

	function rerender(set, value) {
		set(value);
		$.set(renderKey, $.get(renderKey) + 1);
	}

	const usage = $.derived(() => `${scriptOpen}
  import FaultyTerminal from '$lib/components/FaultyTerminal.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden;">
  <FaultyTerminal
    scale={${$.get(scale)}}
    digitSize={${$.get(digitSize)}}
    timeScale={${$.get(timeScale)}}
    scanlineIntensity={${$.get(scanlineIntensity)}}
    curvature={${$.get(curvature)}}
    tint="${$.get(tint)}"
    mouseReact={${$.get(mouseReact)}}
    mouseStrength={${$.get(mouseStrength)}}
    pageLoadAnimation={${$.get(pageLoadAnimation)}}
    noiseAmp={${$.get(noiseAmp)}}
    brightness={${$.get(brightness)}}
  />
</div>`);

	const props = [
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Controls the zoom and scale of the pattern.'
		},

		{
			name: 'gridMul',
			type: '[number, number]',
			default: '[2, 1]',
			description: 'Grid multiplier for glyph density on the x and y axes.'
		},

		{
			name: 'digitSize',
			type: 'number',
			default: '1.5',
			description: 'Size of individual glyphs.'
		},

		{
			name: 'timeScale',
			type: 'number',
			default: '0.3',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'pause',
			type: 'boolean',
			default: 'false',
			description: 'Pauses or resumes animation time.'
		},

		{
			name: 'scanlineIntensity',
			type: 'number',
			default: '0.3',
			description: 'Strength of the scanline effect.'
		},

		{
			name: 'glitchAmount',
			type: 'number',
			default: '1',
			description: 'Glitch displacement intensity.'
		},

		{
			name: 'flickerAmount',
			type: 'number',
			default: '1',
			description: 'Flicker effect strength.'
		},

		{
			name: 'noiseAmp',
			type: 'number',
			default: '1',
			description: 'Noise pattern amplitude.'
		},

		{
			name: 'chromaticAberration',
			type: 'number',
			default: '0',
			description: 'RGB channel separation in pixels.'
		},

		{
			name: 'dither',
			type: 'number | boolean',
			default: '0',
			description: 'Dithering effect intensity.'
		},

		{
			name: 'curvature',
			type: 'number',
			default: '0.2',
			description: 'Barrel distortion amount.'
		},

		{
			name: 'tint',
			type: 'string',
			default: '"#ffffff"',
			description: 'Hex color tint.'
		},

		{
			name: 'mouseReact',
			type: 'boolean',
			default: 'true',
			description: 'Enables mouse interaction.'
		},

		{
			name: 'mouseStrength',
			type: 'number',
			default: '0.2',
			description: 'Mouse interaction intensity.'
		},

		{
			name: 'dpr',
			type: 'number',
			default: 'min(devicePixelRatio, 2)',
			description: 'Renderer pixel ratio.'
		},

		{
			name: 'pageLoadAnimation',
			type: 'boolean',
			default: 'true',
			description: 'Enables the cell fade-in animation on load.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Overall brightness multiplier.'
		},

		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root container.'
		}
	];

	var fragment = root_2();

	$.head('1hhyu81', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Faulty Terminal - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var node_1 = $.child(div);

			$.key(node_1, () => $.get(renderKey), ($$anchor) => {
				FaultyTerminal($$anchor, {
					get scale() {
						return $.get(scale);
					},

					get digitSize() {
						return $.get(digitSize);
					},

					get timeScale() {
						return $.get(timeScale);
					},

					get scanlineIntensity() {
						return $.get(scanlineIntensity);
					},

					get curvature() {
						return $.get(curvature);
					},

					get tint() {
						return $.get(tint);
					},

					get mouseReact() {
						return $.get(mouseReact);
					},

					get mouseStrength() {
						return $.get(mouseStrength);
					},

					get pageLoadAnimation() {
						return $.get(pageLoadAnimation);
					},

					get noiseAmp() {
						return $.get(noiseAmp);
					},

					get brightness() {
						return $.get(brightness);
					}
				});
			});

			var node_2 = $.sibling(node_1, 2);

			BackgroundContentToggle(node_2, {
				get showContent() {
					return $.get(showContent);
				},
				headline: 'It works on my machine, please check again',
				onToggle: (v) => $.set(showContent, v, true)
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'faulty-terminal',
				get usage() {
					return $.get(usage);
				},

				get source() {
					return faultyTerminalSource;
				}
			});
		};

		const customize = ($$anchor) => {
			Customize($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_1();
					var node_3 = $.first_child(fragment_4);

					PreviewColorPicker(node_3, {
						title: 'Tint Color',
						get value() {
							return $.get(tint);
						},
						onChange: (v) => rerender((next) => $.set(tint, next, true), v)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Scale',
						min: 1,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => rerender((next) => $.set(scale, next, true), v)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Digit Size',
						min: 0.5,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(digitSize);
						},
						onChange: (v) => rerender((next) => $.set(digitSize, next, true), v)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(timeScale);
						},
						onChange: (v) => rerender((next) => $.set(timeScale, next, true), v)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Noise Amplitude',
						min: 0.5,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(noiseAmp);
						},
						onChange: (v) => rerender((next) => $.set(noiseAmp, next, true), v)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Brightness',
						min: 0.1,
						max: 1,
						step: 0.1,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => rerender((next) => $.set(brightness, next, true), v)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Scanline Intensity',
						min: 0,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(scanlineIntensity);
						},
						onChange: (v) => rerender((next) => $.set(scanlineIntensity, next, true), v)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Curvature',
						min: 0,
						max: 0.5,
						step: 0.01,
						get value() {
							return $.get(curvature);
						},
						onChange: (v) => rerender((next) => $.set(curvature, next, true), v)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Mouse Strength',
						min: 0,
						max: 2,
						step: 0.1,
						get value() {
							return $.get(mouseStrength);
						},
						onChange: (v) => rerender((next) => $.set(mouseStrength, next, true), v)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSwitch(node_12, {
						title: 'Mouse React',
						get checked() {
							return $.get(mouseReact);
						},
						onChange: (v) => rerender((next) => $.set(mouseReact, next, true), v)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSwitch(node_13, {
						title: 'Page Load Animation',
						get checked() {
							return $.get(pageLoadAnimation);
						},
						onChange: (v) => rerender((next) => $.set(pageLoadAnimation, next, true), v)
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
			componentName: 'FaultyTerminal',
			get usage() {
				return $.get(usage);
			},

			get source() {
				return faultyTerminalSource;
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