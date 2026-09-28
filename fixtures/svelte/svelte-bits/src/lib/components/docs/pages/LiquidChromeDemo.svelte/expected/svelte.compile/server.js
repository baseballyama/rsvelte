import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import LiquidChrome from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte';
import source from '$lib/components/library/Backgrounds/LiquidChrome/LiquidChrome.svelte?raw';

export default function LiquidChromeDemo($$renderer) {
	const DEFAULTS = {
		speed: 0.2,
		amplitude: 0.5,
		frequencyX: 3,
		frequencyY: 2,
		interactive: true
	};

	let speed = DEFAULTS.speed;
	let amplitude = DEFAULTS.amplitude;
	let frequencyX = DEFAULTS.frequencyX;
	let frequencyY = DEFAULTS.frequencyY;
	let interactive = DEFAULTS.interactive;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => speed !== DEFAULTS.speed || amplitude !== DEFAULTS.amplitude || frequencyX !== DEFAULTS.frequencyX || frequencyY !== DEFAULTS.frequencyY || interactive !== DEFAULTS.interactive);

	function reset() {
		speed = DEFAULTS.speed;
		amplitude = DEFAULTS.amplitude;
		frequencyX = DEFAULTS.frequencyX;
		frequencyY = DEFAULTS.frequencyY;
		interactive = DEFAULTS.interactive;
	}

	const usage = $.derived(() => `${scriptOpen}
  import LiquidChrome from '$lib/components/LiquidChrome.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <LiquidChrome
    baseColor={[0.1, 0.1, 0.1]}
    speed={${speed}}
    amplitude={${amplitude}}
    interactive={${interactive}}
  />
</div>`);

	const props = [
		{
			name: 'baseColor',
			type: '[number, number, number]',
			default: '[0.1, 0.1, 0.1]',
			description: 'Base RGB color (0–1).'
		},

		{
			name: 'speed',
			type: 'number',
			default: '0.2',
			description: 'Animation speed.'
		},

		{
			name: 'amplitude',
			type: 'number',
			default: '0.5',
			description: 'Wave amplitude.'
		},

		{
			name: 'frequencyX',
			type: 'number',
			default: '3',
			description: 'X-axis frequency.'
		},

		{
			name: 'frequencyY',
			type: 'number',
			default: '2',
			description: 'Y-axis frequency.'
		},

		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'Pointer interaction.'
		}
	];

	$.head('1i0kxx8', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Liquid Chrome - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Liquid Chrome</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);
			LiquidChrome($$renderer, { speed, amplitude, frequencyX, frequencyY, interactive });
			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'liquid-chrome', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
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
						title: 'Amplitude',
						min: 0,
						max: 2,
						step: 0.05,
						value: amplitude,
						onChange: (v) => amplitude = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Frequency X',
						min: 0,
						max: 10,
						step: 0.1,
						value: frequencyX,
						onChange: (v) => frequencyX = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Frequency Y',
						min: 0,
						max: 10,
						step: 0.1,
						value: frequencyY,
						onChange: (v) => frequencyY = v
					});

					$$renderer.push(`<!----> `);

					PreviewSwitch($$renderer, {
						title: 'Interactive',
						checked: interactive,
						onChange: (v) => interactive = v
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
			componentName: 'LiquidChrome',
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