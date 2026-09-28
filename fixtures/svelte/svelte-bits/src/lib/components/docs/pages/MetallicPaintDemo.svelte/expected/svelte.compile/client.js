import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MetallicPaint from '$lib/components/library/Animations/MetallicPaint/MetallicPaint.svelte';
import source from '$lib/components/library/Animations/MetallicPaint/MetallicPaint.svelte?raw';
import logo from '$lib/assets/logo/svelte-bits-icon-logo-black.svg';

var root = $.from_html(`<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;"><div style="width:min(80%, 500px);aspect-ratio:1;"><!></div></div>`);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<h1 class="sub-category">Metallic Paint</h1> <!>`, 1);

export default function MetallicPaintDemo($$anchor) {
	const DEFAULTS = {
		scale: 4,
		refraction: 0.01,
		blur: 0.015,
		liquid: 0.75,
		speed: 0.3,
		brightness: 2,
		contrast: 0.5,
		fresnel: 1,
		patternSharpness: 1,
		waveAmplitude: 1,
		noiseScale: 0.5,
		chromaticSpread: 2,
		distortion: 1,
		contour: 0.2,
		tintColor: '#FF8A4C',
		mouseAnimation: false
	};

	let scale = $.state($.proxy(DEFAULTS.scale));
	let refraction = $.state($.proxy(DEFAULTS.refraction));
	let blur = $.state($.proxy(DEFAULTS.blur));
	let liquid = $.state($.proxy(DEFAULTS.liquid));
	let speed = $.state($.proxy(DEFAULTS.speed));
	let brightness = $.state($.proxy(DEFAULTS.brightness));
	let contrast = $.state($.proxy(DEFAULTS.contrast));
	let fresnel = $.state($.proxy(DEFAULTS.fresnel));
	let patternSharpness = $.state($.proxy(DEFAULTS.patternSharpness));
	let waveAmplitude = $.state($.proxy(DEFAULTS.waveAmplitude));
	let noiseScale = $.state($.proxy(DEFAULTS.noiseScale));
	let chromaticSpread = $.state($.proxy(DEFAULTS.chromaticSpread));
	let distortion = $.state($.proxy(DEFAULTS.distortion));
	let contour = $.state($.proxy(DEFAULTS.contour));
	let tintColor = $.state($.proxy(DEFAULTS.tintColor));
	let mouseAnimation = $.state($.proxy(DEFAULTS.mouseAnimation));
	const hasChanges = $.derived(() => $.get(scale) !== DEFAULTS.scale || $.get(refraction) !== DEFAULTS.refraction || $.get(blur) !== DEFAULTS.blur || $.get(liquid) !== DEFAULTS.liquid || $.get(speed) !== DEFAULTS.speed || $.get(brightness) !== DEFAULTS.brightness || $.get(contrast) !== DEFAULTS.contrast || $.get(fresnel) !== DEFAULTS.fresnel || $.get(patternSharpness) !== DEFAULTS.patternSharpness || $.get(waveAmplitude) !== DEFAULTS.waveAmplitude || $.get(noiseScale) !== DEFAULTS.noiseScale || $.get(chromaticSpread) !== DEFAULTS.chromaticSpread || $.get(distortion) !== DEFAULTS.distortion || $.get(contour) !== DEFAULTS.contour || $.get(tintColor) !== DEFAULTS.tintColor || $.get(mouseAnimation) !== DEFAULTS.mouseAnimation);

	function reset() {
		$.set(scale, DEFAULTS.scale, true);
		$.set(refraction, DEFAULTS.refraction, true);
		$.set(blur, DEFAULTS.blur, true);
		$.set(liquid, DEFAULTS.liquid, true);
		$.set(speed, DEFAULTS.speed, true);
		$.set(brightness, DEFAULTS.brightness, true);
		$.set(contrast, DEFAULTS.contrast, true);
		$.set(fresnel, DEFAULTS.fresnel, true);
		$.set(patternSharpness, DEFAULTS.patternSharpness, true);
		$.set(waveAmplitude, DEFAULTS.waveAmplitude, true);
		$.set(noiseScale, DEFAULTS.noiseScale, true);
		$.set(chromaticSpread, DEFAULTS.chromaticSpread, true);
		$.set(distortion, DEFAULTS.distortion, true);
		$.set(contour, DEFAULTS.contour, true);
		$.set(tintColor, DEFAULTS.tintColor, true);
		$.set(mouseAnimation, DEFAULTS.mouseAnimation, true);
	}

	const usage = $.derived(() => `<MetallicPaint imageSrc="/logo.svg" tintColor="${$.get(tintColor)}" speed={${$.get(speed)}} liquid={${$.get(liquid)}} />`);

	const props = [
		{
			name: 'imageSrc',
			type: 'string',
			default: 'required',
			description: 'URL to a transparent PNG/SVG mask.'
		},

		{
			name: 'seed',
			type: 'number',
			default: '42',
			description: 'Noise seed.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '4',
			description: 'Pattern scale.'
		},

		{
			name: 'refraction',
			type: 'number',
			default: '0.01',
			description: 'Refraction strength.'
		},

		{
			name: 'blur',
			type: 'number',
			default: '0.015',
			description: 'Edge blur.'
		},

		{
			name: 'liquid',
			type: 'number',
			default: '0.75',
			description: 'Liquid distortion factor.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.3',
			description: 'Animation speed.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '2',
			description: 'Output brightness.'
		},

		{
			name: 'contrast',
			type: 'number',
			default: '0.5',
			description: 'Output contrast.'
		},

		{
			name: 'angle',
			type: 'number',
			default: '0',
			description: 'Light angle.'
		},

		{
			name: 'fresnel',
			type: 'number',
			default: '1',
			description: 'Fresnel strength.'
		},

		{
			name: 'lightColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Highlight color.'
		},

		{
			name: 'darkColor',
			type: 'string',
			default: '"#000000"',
			description: 'Shadow color.'
		},

		{
			name: 'tintColor',
			type: 'string',
			default: '"#feb3ff"',
			description: 'Metallic tint.'
		},

		{
			name: 'patternSharpness',
			type: 'number',
			default: '1',
			description: 'Pattern sharpness.'
		},

		{
			name: 'waveAmplitude',
			type: 'number',
			default: '1',
			description: 'Wave amplitude.'
		},

		{
			name: 'noiseScale',
			type: 'number',
			default: '0.5',
			description: 'Noise scale.'
		},

		{
			name: 'chromaticSpread',
			type: 'number',
			default: '2',
			description: 'Chromatic aberration spread.'
		},

		{
			name: 'distortion',
			type: 'number',
			default: '1',
			description: 'Overall distortion.'
		},

		{
			name: 'contour',
			type: 'number',
			default: '0.2',
			description: 'Contour outline strength.'
		},

		{
			name: 'mouseAnimation',
			type: 'boolean',
			default: 'false',
			description: 'Drive flow with mouse.'
		}
	];

	var fragment = root_2();

	$.head('9frq1h', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Metallic Paint - svelte-bits';
		});
	});

	var node = $.sibling($.first_child(fragment), 2);

	{
		const preview = ($$anchor) => {
			var div = root();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			MetallicPaint(node_1, {
				get imageSrc() {
					return logo;
				},

				get scale() {
					return $.get(scale);
				},

				get refraction() {
					return $.get(refraction);
				},

				get blur() {
					return $.get(blur);
				},

				get liquid() {
					return $.get(liquid);
				},

				get speed() {
					return $.get(speed);
				},

				get brightness() {
					return $.get(brightness);
				},

				get contrast() {
					return $.get(contrast);
				},

				get fresnel() {
					return $.get(fresnel);
				},

				get patternSharpness() {
					return $.get(patternSharpness);
				},

				get waveAmplitude() {
					return $.get(waveAmplitude);
				},

				get noiseScale() {
					return $.get(noiseScale);
				},

				get chromaticSpread() {
					return $.get(chromaticSpread);
				},

				get distortion() {
					return $.get(distortion);
				},

				get contour() {
					return $.get(contour);
				},

				get tintColor() {
					return $.get(tintColor);
				},

				get mouseAnimation() {
					return $.get(mouseAnimation);
				}
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		const code = ($$anchor) => {
			DemoCodeTab($$anchor, {
				slug: 'metallic-paint',
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
						title: 'Tint Color',
						get value() {
							return $.get(tintColor);
						},
						onChange: (v) => $.set(tintColor, v, true)
					});

					var node_3 = $.sibling(node_2, 2);

					PreviewSlider(node_3, {
						title: 'Scale',
						min: 0.5,
						max: 10,
						step: 0.1,
						get value() {
							return $.get(scale);
						},
						onChange: (v) => $.set(scale, v, true)
					});

					var node_4 = $.sibling(node_3, 2);

					PreviewSlider(node_4, {
						title: 'Liquid',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(liquid);
						},
						onChange: (v) => $.set(liquid, v, true)
					});

					var node_5 = $.sibling(node_4, 2);

					PreviewSlider(node_5, {
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(speed);
						},
						onChange: (v) => $.set(speed, v, true)
					});

					var node_6 = $.sibling(node_5, 2);

					PreviewSlider(node_6, {
						title: 'Brightness',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(brightness);
						},
						onChange: (v) => $.set(brightness, v, true)
					});

					var node_7 = $.sibling(node_6, 2);

					PreviewSlider(node_7, {
						title: 'Contrast',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(contrast);
						},
						onChange: (v) => $.set(contrast, v, true)
					});

					var node_8 = $.sibling(node_7, 2);

					PreviewSlider(node_8, {
						title: 'Refraction',
						min: 0,
						max: 0.1,
						step: 0.005,
						get value() {
							return $.get(refraction);
						},
						onChange: (v) => $.set(refraction, v, true)
					});

					var node_9 = $.sibling(node_8, 2);

					PreviewSlider(node_9, {
						title: 'Blur',
						min: 0,
						max: 0.1,
						step: 0.005,
						get value() {
							return $.get(blur);
						},
						onChange: (v) => $.set(blur, v, true)
					});

					var node_10 = $.sibling(node_9, 2);

					PreviewSlider(node_10, {
						title: 'Fresnel',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(fresnel);
						},
						onChange: (v) => $.set(fresnel, v, true)
					});

					var node_11 = $.sibling(node_10, 2);

					PreviewSlider(node_11, {
						title: 'Pattern Sharpness',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(patternSharpness);
						},
						onChange: (v) => $.set(patternSharpness, v, true)
					});

					var node_12 = $.sibling(node_11, 2);

					PreviewSlider(node_12, {
						title: 'Wave Amplitude',
						min: 0,
						max: 3,
						step: 0.1,
						get value() {
							return $.get(waveAmplitude);
						},
						onChange: (v) => $.set(waveAmplitude, v, true)
					});

					var node_13 = $.sibling(node_12, 2);

					PreviewSlider(node_13, {
						title: 'Noise Scale',
						min: 0,
						max: 2,
						step: 0.05,
						get value() {
							return $.get(noiseScale);
						},
						onChange: (v) => $.set(noiseScale, v, true)
					});

					var node_14 = $.sibling(node_13, 2);

					PreviewSlider(node_14, {
						title: 'Chromatic Spread',
						min: 0,
						max: 5,
						step: 0.1,
						get value() {
							return $.get(chromaticSpread);
						},
						onChange: (v) => $.set(chromaticSpread, v, true)
					});

					var node_15 = $.sibling(node_14, 2);

					PreviewSlider(node_15, {
						title: 'Distortion',
						min: 0,
						max: 3,
						step: 0.05,
						get value() {
							return $.get(distortion);
						},
						onChange: (v) => $.set(distortion, v, true)
					});

					var node_16 = $.sibling(node_15, 2);

					PreviewSlider(node_16, {
						title: 'Contour',
						min: 0,
						max: 1,
						step: 0.05,
						get value() {
							return $.get(contour);
						},
						onChange: (v) => $.set(contour, v, true)
					});

					var node_17 = $.sibling(node_16, 2);

					PreviewSwitch(node_17, {
						title: 'Mouse Animation',
						get checked() {
							return $.get(mouseAnimation);
						},
						onChange: (v) => $.set(mouseAnimation, v, true)
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
			componentName: 'MetallicPaint',
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