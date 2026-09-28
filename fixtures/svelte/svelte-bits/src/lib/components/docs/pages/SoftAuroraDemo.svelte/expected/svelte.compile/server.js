import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import SoftAurora from '$lib/components/library/Backgrounds/SoftAurora/SoftAurora.svelte';
import source from '$lib/components/library/Backgrounds/SoftAurora/SoftAurora.svelte?raw';

export default function SoftAuroraDemo($$renderer) {
	const D = {
		speed: 0.6,
		scale: 1.5,
		brightness: 1,
		color1: '#f7f7f7',
		color2: '#ff8a3d',
		bandHeight: 0.5,
		bandSpread: 1,
		colorSpeed: 1,
		enableMouseInteraction: true
	};

	let speed = D.speed;
	let scale = D.scale;
	let brightness = D.brightness;
	let color1 = D.color1;
	let color2 = D.color2;
	let bandHeight = D.bandHeight;
	let bandSpread = D.bandSpread;
	let colorSpeed = D.colorSpeed;
	let enableMouseInteraction = D.enableMouseInteraction;
	let showContent = true;
	const sO = '<' + 'script lang="ts">';
	const sC = '</' + 'script>';
	const hasChanges = $.derived(() => speed !== D.speed || scale !== D.scale || brightness !== D.brightness || color1 !== D.color1 || color2 !== D.color2 || bandHeight !== D.bandHeight || bandSpread !== D.bandSpread || colorSpeed !== D.colorSpeed || enableMouseInteraction !== D.enableMouseInteraction);

	function reset() {
		speed = D.speed;
		scale = D.scale;
		brightness = D.brightness;
		color1 = D.color1;
		color2 = D.color2;
		bandHeight = D.bandHeight;
		bandSpread = D.bandSpread;
		colorSpeed = D.colorSpeed;
		enableMouseInteraction = D.enableMouseInteraction;
	}

	const usage = $.derived(() => `${sO}
  import SoftAurora from '$lib/components/SoftAurora.svelte';
${sC}

<div style="width: 100%; height: 600px; position: relative;">
  <SoftAurora color1="${color1}" color2="${color2}" speed={${speed}} />
</div>`);

	const props = [
		{
			name: 'speed',
			type: 'number',
			default: '0.6',
			description: 'Animation speed.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1.5',
			description: 'Noise scale.'
		},

		{
			name: 'brightness',
			type: 'number',
			default: '1',
			description: 'Overall brightness.'
		},

		{
			name: 'color1',
			type: 'string',
			default: '"#f7f7f7"',
			description: 'Layer 1 color.'
		},

		{
			name: 'color2',
			type: 'string',
			default: '"#e100ff"',
			description: 'Layer 2 color.'
		},

		{
			name: 'noiseFrequency',
			type: 'number',
			default: '2.5',
			description: 'Noise frequency.'
		},

		{
			name: 'noiseAmplitude',
			type: 'number',
			default: '1',
			description: 'Noise amplitude.'
		},

		{
			name: 'bandHeight',
			type: 'number',
			default: '0.5',
			description: 'Aurora band height.'
		},

		{
			name: 'bandSpread',
			type: 'number',
			default: '1',
			description: 'Aurora band spread.'
		},

		{
			name: 'octaveDecay',
			type: 'number',
			default: '0.1',
			description: 'Octave decay.'
		},

		{
			name: 'layerOffset',
			type: 'number',
			default: '0',
			description: 'Second layer offset.'
		},

		{
			name: 'colorSpeed',
			type: 'number',
			default: '1',
			description: 'Color cycle speed.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Mouse interaction.'
		},

		{
			name: 'mouseInfluence',
			type: 'number',
			default: '0.25',
			description: 'Mouse influence.'
		}
	];

	$.head('1hpmr5a', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Soft Aurora - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Soft Aurora</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			SoftAurora($$renderer, {
				speed,
				scale,
				brightness,
				color1,
				color2,
				bandHeight,
				bandSpread,
				colorSpeed,
				enableMouseInteraction
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'soft-aurora', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, { title: 'Color 1', value: color1, onChange: (v) => color1 = v });
					$$renderer.push(`<!----> `);
					PreviewColorPicker($$renderer, { title: 'Color 2', value: color2, onChange: (v) => color2 = v });
					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.1,
						max: 5,
						step: 0.05,
						value: scale,
						onChange: (v) => scale = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Brightness',
						min: 0,
						max: 3,
						step: 0.05,
						value: brightness,
						onChange: (v) => brightness = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Band Height',
						min: -1,
						max: 2,
						step: 0.05,
						value: bandHeight,
						onChange: (v) => bandHeight = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Band Spread',
						min: 0,
						max: 3,
						step: 0.05,
						value: bandSpread,
						onChange: (v) => bandSpread = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Color Speed',
						min: 0,
						max: 3,
						step: 0.05,
						value: colorSpeed,
						onChange: (v) => colorSpeed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Mouse Interaction',
						checked: enableMouseInteraction,
						onChange: (v) => enableMouseInteraction = v
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
			componentName: 'SoftAurora',
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