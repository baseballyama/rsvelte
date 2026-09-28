import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import BackgroundContentToggle from '$lib/components/docs/preview/BackgroundContentToggle.svelte';
import hyperspeedSource from '$lib/components/library/Backgrounds/Hyperspeed/Hyperspeed.svelte?raw';

export default function HyperspeedDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DEFAULTS = { activePreset: 'one' };

		const presetOptions = [
			{ value: 'one', label: 'Cyberpunk' },
			{ value: 'two', label: 'Akira' },
			{ value: 'three', label: 'Golden' },
			{ value: 'four', label: 'Split' },
			{ value: 'five', label: 'Highway' }
		];

		let activePreset = DEFAULTS.activePreset;
		let renderKey = 0;
		let showContent = true;
		let Hyperspeed = null;
		let hyperspeedPresets = {};
		const scriptOpen = '<' + 'script lang="ts">';
		const scriptClose = '</' + 'script>';
		const hasChanges = $.derived(() => activePreset !== DEFAULTS.activePreset);
		const effectOptions = $.derived(() => hyperspeedPresets[activePreset] ?? null);

		function reset() {
			activePreset = DEFAULTS.activePreset;
			renderKey += 1;
		}

		const usage = $.derived(() => `${scriptOpen}
  import Hyperspeed, { hyperspeedPresets } from '$lib/components/Hyperspeed.svelte';
${scriptClose}

<div style="height: 500px; position: relative; overflow: hidden; cursor: pointer;">
  <Hyperspeed effectOptions={hyperspeedPresets.${activePreset}} />
</div>`);

		const props = [
			{
				name: 'effectOptions',
				type: 'Partial<HyperspeedOptions>',
				default: '{}',
				description: 'Configuration object controlling colors, distortion, road geometry, light trail properties, field of view, and speed-up behavior.'
			},

			{
				name: 'class',
				type: 'string',
				default: '""',
				description: 'Extra classes for the root container.'
			}
		];

		$.head('11ncrdz', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Hyperspeed - svelte-bits</title>`);
			});
		});

		$$renderer.push(`<h1 class="sub-category">Hyperspeed</h1> `);

		{
			function preview($$renderer) {
				$$renderer.push(`<div class="relative h-[500px] w-full cursor-pointer overflow-hidden"><!---->`);

				{
					if (Hyperspeed && effectOptions()) {
						$$renderer.push('<!--[0-->');

						if (Hyperspeed) {
							$$renderer.push('<!--[-->');
							Hyperspeed($$renderer, { effectOptions: effectOptions() });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!----> `);

				BackgroundContentToggle($$renderer, {
					showContent,
					headline: 'Click & hold to see the real magic of hyperspeed!',
					onToggle: (v) => showContent = v
				});

				$$renderer.push(`<!----></div>`);
			}

			function code($$renderer) {
				DemoCodeTab($$renderer, { slug: 'hyperspeed', usage: usage(), source: hyperspeedSource });
			}

			function customize($$renderer) {
				Customize($$renderer, {
					children: ($$renderer) => {
						PreviewSelect($$renderer, {
							title: 'Animation Preset',
							options: presetOptions,
							value: activePreset,
							onChange: (v) => {
								activePreset = v;
								renderKey += 1;
							}
						});
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
				componentName: 'Hyperspeed',
				usage: usage(),
				source: hyperspeedSource,
				props,
				preview,
				code,
				customize,
				propTable,
				$$slots: { preview: true, code: true, customize: true, propTable: true }
			});
		}

		$$renderer.push(`<!---->`);
	});
}