import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import Threads from '$lib/components/library/Backgrounds/Threads/Threads.svelte';
import source from '$lib/components/library/Backgrounds/Threads/Threads.svelte?raw';

export default function ThreadsDemo($$renderer) {
	const DEFAULTS = { amplitude: 1, distance: 0, enableMouseInteraction: true };
	let amplitude = DEFAULTS.amplitude;
	let distance = DEFAULTS.distance;
	let enableMouseInteraction = DEFAULTS.enableMouseInteraction;
	let showContent = true;
	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const hasChanges = $.derived(() => amplitude !== DEFAULTS.amplitude || distance !== DEFAULTS.distance || enableMouseInteraction !== DEFAULTS.enableMouseInteraction);

	function reset() {
		amplitude = DEFAULTS.amplitude;
		distance = DEFAULTS.distance;
		enableMouseInteraction = DEFAULTS.enableMouseInteraction;
	}

	const usage = $.derived(() => `${scriptOpen}
  import Threads from '$lib/components/Threads.svelte';
${scriptClose}

<div style="width: 100%; height: 600px; position: relative;">
  <Threads
    amplitude={${amplitude}}
    distance={${distance}}
    enableMouseInteraction={${enableMouseInteraction}}
  />
</div>`);

	const props = [
		{
			name: 'color',
			type: '[number, number, number]',
			default: '[1, 1, 1]',
			description: 'RGB color of the threads (0–1).'
		},

		{
			name: 'amplitude',
			type: 'number',
			default: '1',
			description: 'Wave amplitude.'
		},

		{
			name: 'distance',
			type: 'number',
			default: '0',
			description: 'Vertical separation between threads.'
		},

		{
			name: 'enableMouseInteraction',
			type: 'boolean',
			default: 'false',
			description: 'Whether the threads react to the mouse.'
		}
	];

	$.head('1h6zynb', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Threads - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Threads</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="relative h-[500px] w-full overflow-hidden rounded-[14px]">`);

			Threads($$renderer, {
				color: [1, 0.541, 0.298],
				amplitude,
				distance,
				enableMouseInteraction
			});

			$$renderer.push(`<!----> `);
			BackgroundContentToggle($$renderer, { showContent, onToggle: (v) => showContent = v });
			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'threads', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Amplitude',
						min: 0,
						max: 5,
						step: 0.1,
						value: amplitude,
						onChange: (v) => amplitude = v
					});

					$$renderer.push(`<!----> `);

					PreviewSlider($$renderer, {
						title: 'Distance',
						min: 0,
						max: 1,
						step: 0.05,
						value: distance,
						onChange: (v) => distance = v
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
			componentName: 'Threads',
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