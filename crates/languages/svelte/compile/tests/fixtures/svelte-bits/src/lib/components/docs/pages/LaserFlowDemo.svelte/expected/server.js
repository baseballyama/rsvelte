import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import LaserFlow from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte';
import source from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte?raw';

export default function LaserFlowDemo($$renderer) {
	const DEFAULTS = {
		selectedExample: 'box',
		color: '#FF8A4C',
		horizontalSizing: 0.5,
		verticalSizing: 2.0,
		wispDensity: 1,
		wispSpeed: 15.0,
		wispIntensity: 5.0,
		flowSpeed: 0.35,
		flowStrength: 0.25,
		fogIntensity: 0.45,
		fogScale: 0.3,
		fogFallSpeed: 0.6,
		decay: 1.1,
		falloffStart: 1.2
	};

	let selectedExample = DEFAULTS.selectedExample;
	let color = DEFAULTS.color;
	let horizontalSizing = DEFAULTS.horizontalSizing;
	let verticalSizing = DEFAULTS.verticalSizing;
	let wispDensity = DEFAULTS.wispDensity;
	let wispSpeed = DEFAULTS.wispSpeed;
	let wispIntensity = DEFAULTS.wispIntensity;
	let flowSpeed = DEFAULTS.flowSpeed;
	let flowStrength = DEFAULTS.flowStrength;
	let fogIntensity = DEFAULTS.fogIntensity;
	let fogScale = DEFAULTS.fogScale;
	let fogFallSpeed = DEFAULTS.fogFallSpeed;
	let decay = DEFAULTS.decay;
	let falloffStart = DEFAULTS.falloffStart;
	const hasChanges = $.derived(() => selectedExample !== DEFAULTS.selectedExample || color !== DEFAULTS.color || horizontalSizing !== DEFAULTS.horizontalSizing || verticalSizing !== DEFAULTS.verticalSizing || wispDensity !== DEFAULTS.wispDensity || wispSpeed !== DEFAULTS.wispSpeed || wispIntensity !== DEFAULTS.wispIntensity || flowSpeed !== DEFAULTS.flowSpeed || flowStrength !== DEFAULTS.flowStrength || fogIntensity !== DEFAULTS.fogIntensity || fogScale !== DEFAULTS.fogScale || fogFallSpeed !== DEFAULTS.fogFallSpeed || decay !== DEFAULTS.decay || falloffStart !== DEFAULTS.falloffStart);

	function reset() {
		selectedExample = DEFAULTS.selectedExample;
		color = DEFAULTS.color;
		horizontalSizing = DEFAULTS.horizontalSizing;
		verticalSizing = DEFAULTS.verticalSizing;
		wispDensity = DEFAULTS.wispDensity;
		wispSpeed = DEFAULTS.wispSpeed;
		wispIntensity = DEFAULTS.wispIntensity;
		flowSpeed = DEFAULTS.flowSpeed;
		flowStrength = DEFAULTS.flowStrength;
		fogIntensity = DEFAULTS.fogIntensity;
		fogScale = DEFAULTS.fogScale;
		fogFallSpeed = DEFAULTS.fogFallSpeed;
		decay = DEFAULTS.decay;
		falloffStart = DEFAULTS.falloffStart;
	}

	let containerRef;
	let revealImg;

	function onMove(e) {
		if (!containerRef || !revealImg) return;

		const rect = containerRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		revealImg.style.setProperty('--mx', `${x}px`);
		revealImg.style.setProperty('--my', `${y + rect.height * 0.5}px`);
	}

	function onLeave() {
		if (!revealImg) return;

		revealImg.style.setProperty('--mx', '-9999px');
		revealImg.style.setProperty('--my', '-9999px');
	}

	const horizontalBeamOffset = $.derived(() => selectedExample === 'box' ? 0.1 : 0.0);
	const verticalBeamOffset = $.derived(() => selectedExample === 'box' ? -0.2 : -0.5);
	const usage = $.derived(() => `<LaserFlow color="${color}" flowSpeed={${flowSpeed}} fogIntensity={${fogIntensity}} wispDensity={${wispDensity}} />`);

	const props = [
		{
			name: 'color',
			type: 'string',
			default: '"#FF79C6"',
			description: 'Beam color (hex).'
		},

		{
			name: 'flowSpeed',
			type: 'number',
			default: '0.35',
			description: "Speed of the beam's flow modulation."
		},

		{
			name: 'flowStrength',
			type: 'number',
			default: '0.25',
			description: "Strength of the beam's flow modulation."
		},

		{
			name: 'wispDensity',
			type: 'number',
			default: '1',
			description: 'Density of micro-streak wisps.'
		},

		{
			name: 'wispSpeed',
			type: 'number',
			default: '15.0',
			description: 'Speed of wisp motion.'
		},

		{
			name: 'wispIntensity',
			type: 'number',
			default: '5.0',
			description: 'Brightness of wisps.'
		},

		{
			name: 'fogIntensity',
			type: 'number',
			default: '0.45',
			description: 'Overall volumetric fog intensity.'
		},

		{
			name: 'fogScale',
			type: 'number',
			default: '0.3',
			description: 'Spatial scale for the fog noise.'
		},

		{
			name: 'fogFallSpeed',
			type: 'number',
			default: '0.6',
			description: 'Drift speed for the fog field.'
		},

		{
			name: 'horizontalBeamOffset',
			type: 'number',
			default: '0.1',
			description: 'Horizontal offset of the beam (0–1 of canvas width).'
		},

		{
			name: 'verticalBeamOffset',
			type: 'number',
			default: '0.0',
			description: 'Vertical offset of the beam (0–1 of canvas height).'
		},

		{
			name: 'horizontalSizing',
			type: 'number',
			default: '0.5',
			description: 'Horizontal sizing factor of the beam footprint.'
		},

		{
			name: 'verticalSizing',
			type: 'number',
			default: '2.0',
			description: 'Vertical sizing factor of the beam footprint.'
		},

		{
			name: 'mouseTiltStrength',
			type: 'number',
			default: '0.01',
			description: 'How much mouse x tilts the fog volume.'
		},

		{
			name: 'mouseSmoothTime',
			type: 'number',
			default: '0.0',
			description: 'Pointer smoothing time (seconds).'
		},

		{
			name: 'decay',
			type: 'number',
			default: '1.1',
			description: 'Beam decay shaping for sampling envelope.'
		},

		{
			name: 'falloffStart',
			type: 'number',
			default: '1.2',
			description: 'Falloff start radius used in inverse-square blending.'
		},

		{
			name: 'dpr',
			type: 'number',
			default: 'auto',
			description: 'Device pixel ratio override (defaults to window.devicePixelRatio).'
		}
	];

	$.head('15o8pvx', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Laser Flow - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Laser Flow</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;" role="presentation"><!---->`);

			{
				LaserFlow($$renderer, {
					color,
					horizontalBeamOffset: horizontalBeamOffset(),
					verticalBeamOffset: verticalBeamOffset(),
					horizontalSizing,
					verticalSizing,
					wispDensity,
					wispSpeed,
					wispIntensity,
					flowSpeed,
					flowStrength,
					fogIntensity,
					fogScale,
					fogFallSpeed,
					decay,
					falloffStart
				});
			}

			$$renderer.push(`<!----> `);

			if (selectedExample === 'box') {
				$$renderer.push(`<!--[0--><div${$.attr_style(`position:absolute;top:70%;left:50%;transform:translateX(-50%);width:86%;height:60%;background:#111;border-radius:20px;border:2px solid ${$.stringify(color)};z-index:6;pointer-events:none;`)}></div> <img src="https://cdn.dribbble.com/userupload/15325964/file/original-25ae735b5d9255a4a31d3471fd1c346a.png?resize=1024x768&amp;vertical=center" alt="" style="position:absolute;top:-50%;width:100%;z-index:2;mix-blend-mode:luminosity;opacity:0.3;pointer-events:none;--mx:-9999px;--my:-9999px;-webkit-mask-image:radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px);mask-image:radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px);-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;"/>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'laser-flow', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Demo Example',
						value: selectedExample,
						options: [
							{ label: 'Box', value: 'box' },
							{ label: 'Basic', value: 'basic' }
						],
						onChange: (v) => selectedExample = v
					});

					$$renderer.push(`<!----> `);
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Horizontal Sizing',
						min: 0.1,
						max: 3,
						step: 0.05,
						value: horizontalSizing,
						onChange: (v) => horizontalSizing = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Vertical Sizing',
						min: 0.1,
						max: 5,
						step: 0.05,
						value: verticalSizing,
						onChange: (v) => verticalSizing = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wisp Density',
						min: 0,
						max: 5,
						step: 0.1,
						value: wispDensity,
						onChange: (v) => wispDensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wisp Speed',
						min: 0,
						max: 50,
						step: 1,
						value: wispSpeed,
						onChange: (v) => wispSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wisp Intensity',
						min: 0,
						max: 20,
						step: 0.5,
						value: wispIntensity,
						onChange: (v) => wispIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Flow Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: flowSpeed,
						onChange: (v) => flowSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Flow Strength',
						min: 0,
						max: 2,
						step: 0.05,
						value: flowStrength,
						onChange: (v) => flowStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fog Intensity',
						min: 0,
						max: 2,
						step: 0.05,
						value: fogIntensity,
						onChange: (v) => fogIntensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fog Scale',
						min: 0,
						max: 2,
						step: 0.05,
						value: fogScale,
						onChange: (v) => fogScale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Fog Fall Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: fogFallSpeed,
						onChange: (v) => fogFallSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Decay',
						min: 0,
						max: 3,
						step: 0.05,
						value: decay,
						onChange: (v) => decay = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Falloff Start',
						min: 0,
						max: 3,
						step: 0.05,
						value: falloffStart,
						onChange: (v) => falloffStart = v
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
			componentName: 'LaserFlow',
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