import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Lightning from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte';
import source from '$lib/components/library/Backgrounds/Lightning/Lightning.svelte?raw';

export default function LightningDemo($$renderer) {
	const DEFAULTS = { hue: 230, xOffset: 0, speed: 1, intensity: 1, size: 1 };
	let hue = DEFAULTS.hue;
	let xOffset = DEFAULTS.xOffset;
	let speed = DEFAULTS.speed;
	let intensity = DEFAULTS.intensity;
	let size = DEFAULTS.size;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => hue !== DEFAULTS.hue || xOffset !== DEFAULTS.xOffset || speed !== DEFAULTS.speed || intensity !== DEFAULTS.intensity || size !== DEFAULTS.size);

	function reset() {
		hue = DEFAULTS.hue;
		xOffset = DEFAULTS.xOffset;
		speed = DEFAULTS.speed;
		intensity = DEFAULTS.intensity;
		size = DEFAULTS.size;
	}

	const usage = $.derived(() => `${scriptOpen}
  import Lightning from '$lib/components/Lightning.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Lightning hue={${hue}} xOffset={${xOffset}} speed={${speed}} intensity={${intensity}} size={${size}} />
</div>`);

	const props = [
		{
			name: 'hue',
			type: 'number',
			default: '230',
			description: 'Color hue (0–360).'
		},

		{
			name: 'xOffset',
			type: 'number',
			default: '0',
			description: 'Horizontal offset.'
		},

		{
			name: 'speed',
			type: 'number',
			default: '1',
			description: 'Animation speed.'
		},

		{
			name: 'intensity',
			type: 'number',
			default: '1',
			description: 'Bolt intensity multiplier.'
		},

		{
			name: 'size',
			type: 'number',
			default: '1',
			description: 'Size of the bolt pattern.'
		}
	];

	$.head('1nlqon2', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Lightning - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Lightning</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);
			Lightning($$renderer, { hue, xOffset, speed, intensity, size });
			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'lightning', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Hue',
						min: 0,
						max: 360,
						step: 1,
						value: hue,
						onChange: (v) => hue = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'X Offset',
						min: -1,
						max: 1,
						step: 0.05,
						value: xOffset,
						onChange: (v) => xOffset = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Speed',
						min: 0,
						max: 5,
						step: 0.05,
						value: speed,
						onChange: (v) => speed = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Intensity',
						min: 0,
						max: 3,
						step: 0.05,
						value: intensity,
						onChange: (v) => intensity = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Size',
						min: 0.1,
						max: 5,
						step: 0.05,
						value: size,
						onChange: (v) => size = v
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
			componentName: 'Lightning',
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