import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import MagicRings from '$lib/components/library/Animations/MagicRings/MagicRings.svelte';
import source from '$lib/components/library/Animations/MagicRings/MagicRings.svelte?raw';

export default function MagicRingsDemo($$renderer) {
	const DEFAULTS = {
		color: '#FF3E00',
		colorTwo: '#FF8A4C',
		speed: 1,
		ringCount: 6,
		attenuation: 10,
		lineThickness: 2,
		baseRadius: 0.35,
		radiusStep: 0.1,
		scaleRate: 0.1,
		opacity: 1,
		blur: 0,
		noiseAmount: 0.1,
		rotation: 0,
		ringGap: 1.5,
		fadeIn: 0.7,
		fadeOut: 0.5,
		followMouse: true,
		mouseInfluence: 0.2,
		hoverScale: 1.2,
		parallax: 0.05,
		clickBurst: true
	};

	let color = DEFAULTS.color;
	let colorTwo = DEFAULTS.colorTwo;
	let speed = DEFAULTS.speed;
	let ringCount = DEFAULTS.ringCount;
	let attenuation = DEFAULTS.attenuation;
	let lineThickness = DEFAULTS.lineThickness;
	let baseRadius = DEFAULTS.baseRadius;
	let radiusStep = DEFAULTS.radiusStep;
	let scaleRate = DEFAULTS.scaleRate;
	let opacity = DEFAULTS.opacity;
	let blur = DEFAULTS.blur;
	let noiseAmount = DEFAULTS.noiseAmount;
	let rotation = DEFAULTS.rotation;
	let ringGap = DEFAULTS.ringGap;
	let fadeIn = DEFAULTS.fadeIn;
	let fadeOut = DEFAULTS.fadeOut;
	let followMouse = DEFAULTS.followMouse;
	let mouseInfluence = DEFAULTS.mouseInfluence;
	let hoverScale = DEFAULTS.hoverScale;
	let parallax = DEFAULTS.parallax;
	let clickBurst = DEFAULTS.clickBurst;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => color !== DEFAULTS.color || colorTwo !== DEFAULTS.colorTwo || speed !== DEFAULTS.speed || ringCount !== DEFAULTS.ringCount || attenuation !== DEFAULTS.attenuation || lineThickness !== DEFAULTS.lineThickness || baseRadius !== DEFAULTS.baseRadius || radiusStep !== DEFAULTS.radiusStep || scaleRate !== DEFAULTS.scaleRate || opacity !== DEFAULTS.opacity || blur !== DEFAULTS.blur || noiseAmount !== DEFAULTS.noiseAmount || rotation !== DEFAULTS.rotation || ringGap !== DEFAULTS.ringGap || fadeIn !== DEFAULTS.fadeIn || fadeOut !== DEFAULTS.fadeOut || followMouse !== DEFAULTS.followMouse || mouseInfluence !== DEFAULTS.mouseInfluence || hoverScale !== DEFAULTS.hoverScale || parallax !== DEFAULTS.parallax || clickBurst !== DEFAULTS.clickBurst);

	function reset() {
		color = DEFAULTS.color;
		colorTwo = DEFAULTS.colorTwo;
		speed = DEFAULTS.speed;
		ringCount = DEFAULTS.ringCount;
		attenuation = DEFAULTS.attenuation;
		lineThickness = DEFAULTS.lineThickness;
		baseRadius = DEFAULTS.baseRadius;
		radiusStep = DEFAULTS.radiusStep;
		scaleRate = DEFAULTS.scaleRate;
		opacity = DEFAULTS.opacity;
		blur = DEFAULTS.blur;
		noiseAmount = DEFAULTS.noiseAmount;
		rotation = DEFAULTS.rotation;
		ringGap = DEFAULTS.ringGap;
		fadeIn = DEFAULTS.fadeIn;
		fadeOut = DEFAULTS.fadeOut;
		followMouse = DEFAULTS.followMouse;
		mouseInfluence = DEFAULTS.mouseInfluence;
		hoverScale = DEFAULTS.hoverScale;
		parallax = DEFAULTS.parallax;
		clickBurst = DEFAULTS.clickBurst;
	}

	const usage = $.derived(() => `${scriptOpen}
  import MagicRings from '$lib/components/MagicRings.svelte';
${scriptClose}

<MagicRings
  color="${color}"
  colorTwo="${colorTwo}"
  speed={${speed}}
  ringCount={${ringCount}}
  attenuation={${attenuation}}
  lineThickness={${lineThickness}}
  baseRadius={${baseRadius}}
  radiusStep={${radiusStep}}
  scaleRate={${scaleRate}}
  opacity={${opacity}}
  blur={${blur}}
  noiseAmount={${noiseAmount}}
  rotation={${rotation}}
  ringGap={${ringGap}}
  fadeIn={${fadeIn}}
  fadeOut={${fadeOut}}
  followMouse={${followMouse}}
  mouseInfluence={${mouseInfluence}}
  hoverScale={${hoverScale}}
  parallax={${parallax}}
  clickBurst={${clickBurst}}
/>`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#FF3E00"',
			description: 'Primary ring color.'
		},

		{
			name: 'colorTwo',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Secondary color blended across rings.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed multiplier.'
		},

		{
			name: 'ringCount',
			type: 'number',
			default: '6',
			description: 'Number of rings (1–10).'
		},

		{
			name: 'attenuation',
			type: 'number',
			default: '10',
			description: 'How quickly ring intensity falls off.'
		},

		{
			name: 'lineThickness',
			type: 'number',
			default: '2',
			description: 'Stroke thickness multiplier.'
		},

		{
			name: 'baseRadius',
			type: 'number',
			default: '0.35',
			description: 'Radius of the innermost ring (0–0.5).'
		},

		{
			name: 'radiusStep',
			type: 'number',
			default: '0.1',
			description: 'Radius increment per ring.'
		},

		{
			name: 'scaleRate',
			type: 'number',
			default: '0.1',
			description: 'How much each ring grows per cycle.'
		},

		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Overall opacity (0–1).'
		},

		{
			name: 'blur',
			type: 'number',
			default: '0',
			description: 'CSS blur applied to the canvas (px).'
		},

		{
			name: 'noiseAmount',
			type: 'number',
			default: '0.1',
			description: 'Per-pixel noise amount.'
		},

		{
			name: 'rotation',
			type: 'number',
			default: '0',
			description: 'Rotation in degrees applied before render.'
		},

		{
			name: 'ringGap',
			type: 'number',
			default: '1.5',
			description: 'Falloff exponent that shapes ring gaps.'
		},

		{
			name: 'fadeIn',
			type: 'number',
			default: '0.7',
			description: 'Cycle fraction used for fade-in.'
		},

		{
			name: 'fadeOut',
			type: 'number',
			default: '0.5',
			description: 'Cycle fraction used for fade-out.'
		},

		{
			name: 'followMouse',
			type: 'boolean',
			default: 'false',
			description: 'Whether rings drift toward the cursor.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '0.2',
			description: 'Strength of mouse-driven offset.'
		},

		{
			name: 'hoverScale',
			type: 'number',
			default: '1.2',
			description: 'Scale multiplier on hover.'
		},

		{
			name: 'parallax',
			type: 'number',
			default: '0.05',
			description: 'Per-ring parallax offset multiplier.'
		},

		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'false',
			description: 'Trigger an expansion burst on click.'
		}
	];

	$.head('1y548f0', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Magic Rings - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Magic Rings</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div style="position:relative;width:100%;height:400px;border-radius:14px;overflow:hidden;background:var(--bg-body);">`);

			MagicRings($$renderer, {
				color,
				colorTwo,
				speed,
				ringCount,
				attenuation,
				lineThickness,
				baseRadius,
				radiusStep,
				scaleRate,
				opacity,
				blur,
				noiseAmount,
				rotation,
				ringGap,
				fadeIn,
				fadeOut,
				followMouse,
				mouseInfluence,
				hoverScale,
				parallax,
				clickBurst
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'magic-rings', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewColorPicker($$renderer, {
						title: 'Color Two',
						value: colorTwo,
						onChange: (v) => colorTwo = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.1,
						value: speed,
						valueUnit: 'x',
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Ring Count',
						min: 1,
						max: 10,
						step: 1,
						value: ringCount,
						onChange: (v) => ringCount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Attenuation',
						min: 1,
						max: 30,
						step: 0.5,
						value: attenuation,
						onChange: (v) => attenuation = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Line Thickness',
						min: 1,
						max: 10,
						step: 0.5,
						value: lineThickness,
						onChange: (v) => lineThickness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Base Radius',
						min: 0.1,
						max: 0.5,
						step: 0.01,
						value: baseRadius,
						onChange: (v) => baseRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Radius Step',
						min: 0.05,
						max: 0.3,
						step: 0.01,
						value: radiusStep,
						onChange: (v) => radiusStep = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale Rate',
						min: 0,
						max: 0.2,
						step: 0.01,
						value: scaleRate,
						onChange: (v) => scaleRate = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Opacity',
						min: 0,
						max: 1,
						step: 0.05,
						value: opacity,
						onChange: (v) => opacity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Blur',
						min: 0,
						max: 10,
						step: 0.5,
						value: blur,
						valueUnit: 'px',
						onChange: (v) => blur = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Noise',
						min: 0,
						max: 0.5,
						step: 0.01,
						value: noiseAmount,
						onChange: (v) => noiseAmount = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Rotation',
						min: 0,
						max: 360,
						step: 1,
						value: rotation,
						valueUnit: '°',
						onChange: (v) => rotation = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Ring Gap',
						min: 1,
						max: 3,
						step: 0.1,
						value: ringGap,
						onChange: (v) => ringGap = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fade In',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						value: fadeIn,
						onChange: (v) => fadeIn = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fade Out',
						min: 0.1,
						max: 1.5,
						step: 0.05,
						value: fadeOut,
						onChange: (v) => fadeOut = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Follow Mouse',
						checked: followMouse,
						onChange: (v) => followMouse = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Mouse Influence',
						min: 0,
						max: 1,
						step: 0.05,
						value: mouseInfluence,
						onChange: (v) => mouseInfluence = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Hover Scale',
						min: 1,
						max: 2,
						step: 0.05,
						value: hoverScale,
						onChange: (v) => hoverScale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Parallax',
						min: 0,
						max: 0.2,
						step: 0.01,
						value: parallax,
						onChange: (v) => parallax = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Click Burst',
						checked: clickBurst,
						onChange: (v) => clickBurst = v
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
			componentName: 'MagicRings',
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