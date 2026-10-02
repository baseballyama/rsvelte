import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import Antigravity from '$lib/components/library/Animations/Antigravity/Antigravity.svelte';
import source from '$lib/components/library/Animations/Antigravity/Antigravity.svelte?raw';

export default function AntigravityDemo($$renderer) {
	const DEFAULTS = {
		count: 300,
		color: '#FF8A4C',
		particleShape: 'capsule',
		magnetRadius: 10,
		ringRadius: 10,
		waveSpeed: 0.4,
		waveAmplitude: 1,
		particleSize: 2,
		lerpSpeed: 0.1,
		autoAnimate: false,
		fieldStrength: 10
	};

	let count = DEFAULTS.count;
	let color = DEFAULTS.color;
	let particleShape = DEFAULTS.particleShape;
	let magnetRadius = DEFAULTS.magnetRadius;
	let ringRadius = DEFAULTS.ringRadius;
	let waveSpeed = DEFAULTS.waveSpeed;
	let waveAmplitude = DEFAULTS.waveAmplitude;
	let particleSize = DEFAULTS.particleSize;
	let lerpSpeed = DEFAULTS.lerpSpeed;
	let autoAnimate = DEFAULTS.autoAnimate;
	let fieldStrength = DEFAULTS.fieldStrength;
	const hasChanges = $.derived(() => count !== DEFAULTS.count || color !== DEFAULTS.color || particleShape !== DEFAULTS.particleShape || magnetRadius !== DEFAULTS.magnetRadius || ringRadius !== DEFAULTS.ringRadius || waveSpeed !== DEFAULTS.waveSpeed || waveAmplitude !== DEFAULTS.waveAmplitude || particleSize !== DEFAULTS.particleSize || lerpSpeed !== DEFAULTS.lerpSpeed || autoAnimate !== DEFAULTS.autoAnimate || fieldStrength !== DEFAULTS.fieldStrength);

	function reset() {
		count = DEFAULTS.count;
		color = DEFAULTS.color;
		particleShape = DEFAULTS.particleShape;
		magnetRadius = DEFAULTS.magnetRadius;
		ringRadius = DEFAULTS.ringRadius;
		waveSpeed = DEFAULTS.waveSpeed;
		waveAmplitude = DEFAULTS.waveAmplitude;
		particleSize = DEFAULTS.particleSize;
		lerpSpeed = DEFAULTS.lerpSpeed;
		autoAnimate = DEFAULTS.autoAnimate;
		fieldStrength = DEFAULTS.fieldStrength;
	}

	const usage = $.derived(() => `<Antigravity count={${count}} color="${color}" particleShape="${particleShape}" magnetRadius={${magnetRadius}} fieldStrength={${fieldStrength}} />`);

	const props = [
		{
			name: 'count',
			type: 'number',
			default: '300',
			description: 'Number of particles.'
		},

		{
			name: 'color',
			type: 'string',
			default: '"#FF9FFC"',
			description: 'Particle color.'
		},

		{
			name: 'particleShape',
			type: '"capsule" | "sphere" | "box" | "tetrahedron"',
			default: '"capsule"',
			description: 'Geometry per particle.'
		},

		{
			name: 'magnetRadius',
			type: 'number',
			default: '10',
			description: 'Cursor pull radius.'
		},

		{
			name: 'ringRadius',
			type: 'number',
			default: '10',
			description: 'Idle ring formation radius.'
		},

		{
			name: 'waveSpeed',
			type: 'number',
			default: '0.4',
			description: 'Wave-motion speed.'
		},

		{
			name: 'waveAmplitude',
			type: 'number',
			default: '1',
			description: 'Wave amplitude.'
		},

		{
			name: 'particleSize',
			type: 'number',
			default: '2',
			description: 'Particle size scale.'
		},

		{
			name: 'lerpSpeed',
			type: 'number',
			default: '0.1',
			description: 'Lerp factor for following motion.'
		},

		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'false',
			description: 'Animate automatically when idle.'
		},

		{
			name: 'fieldStrength',
			type: 'number',
			default: '10',
			description: 'Strength of the magnetic field.'
		}
	];

	$.head('9tmf2', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Antigravity - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Antigravity</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:600px;overflow:hidden;"><div style="position:absolute;inset:0;">`);

			Antigravity($$renderer, {
				count,
				color,
				particleShape,
				magnetRadius,
				ringRadius,
				waveSpeed,
				waveAmplitude,
				particleSize,
				lerpSpeed,
				autoAnimate,
				fieldStrength
			});

			$$renderer.push(`<!----></div></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'antigravity', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color', value: color, onChange: (v) => color = v });
					$$renderer.push(`<!----> `);

					PreviewSelect($$renderer, {
						title: 'Particle Shape',
						value: particleShape,
						options: [
							{ label: 'Capsule', value: 'capsule' },
							{ label: 'Sphere', value: 'sphere' },
							{ label: 'Box', value: 'box' },
							{ label: 'Tetrahedron', value: 'tetrahedron' }
						],
						onChange: (v) => particleShape = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Count',
						min: 50,
						max: 1000,
						step: 10,
						value: count,
						onChange: (v) => count = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Magnet Radius',
						min: 1,
						max: 30,
						step: 1,
						value: magnetRadius,
						onChange: (v) => magnetRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Ring Radius',
						min: 1,
						max: 30,
						step: 1,
						value: ringRadius,
						onChange: (v) => ringRadius = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: waveSpeed,
						onChange: (v) => waveSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Wave Amplitude',
						min: 0,
						max: 5,
						step: 0.1,
						value: waveAmplitude,
						onChange: (v) => waveAmplitude = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Particle Size',
						min: 0.5,
						max: 5,
						step: 0.1,
						value: particleSize,
						onChange: (v) => particleSize = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Lerp Speed',
						min: 0.01,
						max: 1,
						step: 0.01,
						value: lerpSpeed,
						onChange: (v) => lerpSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Field Strength',
						min: 1,
						max: 50,
						step: 1,
						value: fieldStrength,
						onChange: (v) => fieldStrength = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Auto Animate',
						checked: autoAnimate,
						onChange: (v) => autoAnimate = v
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
			componentName: 'Antigravity',
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