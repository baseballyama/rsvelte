import * as $ from 'svelte/internal/server';
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

export default function MetallicPaintDemo($$renderer) {
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

	let scale = DEFAULTS.scale;
	let refraction = DEFAULTS.refraction;
	let blur = DEFAULTS.blur;
	let liquid = DEFAULTS.liquid;
	let speed = DEFAULTS.speed;
	let brightness = DEFAULTS.brightness;
	let contrast = DEFAULTS.contrast;
	let fresnel = DEFAULTS.fresnel;
	let patternSharpness = DEFAULTS.patternSharpness;
	let waveAmplitude = DEFAULTS.waveAmplitude;
	let noiseScale = DEFAULTS.noiseScale;
	let chromaticSpread = DEFAULTS.chromaticSpread;
	let distortion = DEFAULTS.distortion;
	let contour = DEFAULTS.contour;
	let tintColor = DEFAULTS.tintColor;
	let mouseAnimation = DEFAULTS.mouseAnimation;
	const hasChanges = $.derived(() => scale !== DEFAULTS.scale || refraction !== DEFAULTS.refraction || blur !== DEFAULTS.blur || liquid !== DEFAULTS.liquid || speed !== DEFAULTS.speed || brightness !== DEFAULTS.brightness || contrast !== DEFAULTS.contrast || fresnel !== DEFAULTS.fresnel || patternSharpness !== DEFAULTS.patternSharpness || waveAmplitude !== DEFAULTS.waveAmplitude || noiseScale !== DEFAULTS.noiseScale || chromaticSpread !== DEFAULTS.chromaticSpread || distortion !== DEFAULTS.distortion || contour !== DEFAULTS.contour || tintColor !== DEFAULTS.tintColor || mouseAnimation !== DEFAULTS.mouseAnimation);

	function reset() {
		scale = DEFAULTS.scale;
		refraction = DEFAULTS.refraction;
		blur = DEFAULTS.blur;
		liquid = DEFAULTS.liquid;
		speed = DEFAULTS.speed;
		brightness = DEFAULTS.brightness;
		contrast = DEFAULTS.contrast;
		fresnel = DEFAULTS.fresnel;
		patternSharpness = DEFAULTS.patternSharpness;
		waveAmplitude = DEFAULTS.waveAmplitude;
		noiseScale = DEFAULTS.noiseScale;
		chromaticSpread = DEFAULTS.chromaticSpread;
		distortion = DEFAULTS.distortion;
		contour = DEFAULTS.contour;
		tintColor = DEFAULTS.tintColor;
		mouseAnimation = DEFAULTS.mouseAnimation;
	}

	const usage = $.derived(() => `<MetallicPaint imageSrc="/logo.svg" tintColor="${tintColor}" speed={${speed}} liquid={${liquid}} />`);

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

	$.head('9frq1h', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Metallic Paint - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Metallic Paint</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:600px;display:flex;align-items:center;justify-content:center;"><div style="width:min(80%, 500px);aspect-ratio:1;">`);

			MetallicPaint($$renderer, {
				imageSrc: logo,
				scale,
				refraction,
				blur,
				liquid,
				speed,
				brightness,
				contrast,
				fresnel,
				patternSharpness,
				waveAmplitude,
				noiseScale,
				chromaticSpread,
				distortion,
				contour,
				tintColor,
				mouseAnimation
			});

			$$renderer.push(`<!----></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'metallic-paint', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Tint Color',
						value: tintColor,
						onChange: (v) => tintColor = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.5,
						max: 10,
						step: 0.1,
						value: scale,
						onChange: (v) => scale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Liquid',
						min: 0,
						max: 2,
						step: 0.05,
						value: liquid,
						onChange: (v) => liquid = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 2,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Brightness',
						min: 0,
						max: 5,
						step: 0.1,
						value: brightness,
						onChange: (v) => brightness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Contrast',
						min: 0,
						max: 2,
						step: 0.05,
						value: contrast,
						onChange: (v) => contrast = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Refraction',
						min: 0,
						max: 0.1,
						step: 0.005,
						value: refraction,
						onChange: (v) => refraction = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blur',
						min: 0,
						max: 0.1,
						step: 0.005,
						value: blur,
						onChange: (v) => blur = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fresnel',
						min: 0,
						max: 5,
						step: 0.1,
						value: fresnel,
						onChange: (v) => fresnel = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Pattern Sharpness',
						min: 0,
						max: 3,
						step: 0.1,
						value: patternSharpness,
						onChange: (v) => patternSharpness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Amplitude',
						min: 0,
						max: 3,
						step: 0.1,
						value: waveAmplitude,
						onChange: (v) => waveAmplitude = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise Scale',
						min: 0,
						max: 2,
						step: 0.05,
						value: noiseScale,
						onChange: (v) => noiseScale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Chromatic Spread',
						min: 0,
						max: 5,
						step: 0.1,
						value: chromaticSpread,
						onChange: (v) => chromaticSpread = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Distortion',
						min: 0,
						max: 3,
						step: 0.05,
						value: distortion,
						onChange: (v) => distortion = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Contour',
						min: 0,
						max: 1,
						step: 0.05,
						value: contour,
						onChange: (v) => contour = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mouse Animation',
						checked: mouseAnimation,
						onChange: (v) => mouseAnimation = v
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		function propTable($$renderer) {
			PropTable($$renderer, { rows: props });
		}

		TabsLayout($$renderer, {
			onreset: reset,
			hasChanges: hasChanges(),
			componentName: 'MetallicPaint',
			usage: usage(),
			source,
			props,
			preview,
			code,
			customize,
			propTable,
			$$slots: { preview: true, code: true, customize: true, propTable: true }
		});
	}

	$$renderer.push(`<!---->`);
}