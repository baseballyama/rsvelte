import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import SpotlightCard from '$lib/components/library/Components/SpotlightCard/SpotlightCard.svelte';
import source from '$lib/components/library/Components/SpotlightCard/SpotlightCard.svelte?raw';

export default function SpotlightCardDemo($$renderer) {
	const DEFAULT = '#ffffff40';
	let spotlightColor = DEFAULT;
	const hasChanges = $.derived(() => spotlightColor !== DEFAULT);

	const usage = `<SpotlightCard spotlightColor="rgba(255,255,255,0.25)">
  <!-- content -->
</SpotlightCard>`;

	const props = [
		{
			name: 'spotlightColor',
			type: 'string',
			default: 'rgba(255, 255, 255, 0.25)',
			description: 'Color of the radial spotlight gradient.'
		},

		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Additional classes for the card.'
		}
	];

	function reset() {
		spotlightColor = DEFAULT;
	}

	$.head('1nt2w6q', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Spotlight Card - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Spotlight Card</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;display:flex;align-items:center;justify-content:center;padding:2.5rem 0;">`);

			SpotlightCard($$renderer, {
				class: 'w-[320px]',
				spotlightColor,
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex h-full flex-col items-start justify-center"><svg width="48" height="48" viewBox="0 0 24 24" fill="white" class="mb-3"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6L12 2zm7 11l.9 2.7L22 17l-2.1.9L19 21l-.9-2.1L16 17l2.1-1.3L19 13zM5 13l.7 2.3L8 17l-2.3.7L5 21l-.7-2.3L2 17l2.3-1.7L5 13z"></path></svg> <p style="font-weight:600;font-size:1.4rem;letter-spacing:-0.5px;color:white;">Boost Your Experience</p> <p style="color:#a1a1aa;font-size:14px;margin-top:4px;margin-bottom:2rem;">Get exclusive benefits, features &amp; 24/7 support as a permanent club member.</p></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'spotlight-card', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewColorPicker($$renderer, {
						title: 'Spotlight Color',
						value: spotlightColor,
						onChange: (v) => spotlightColor = v
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
			componentName: 'SpotlightCard',
			usage,
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