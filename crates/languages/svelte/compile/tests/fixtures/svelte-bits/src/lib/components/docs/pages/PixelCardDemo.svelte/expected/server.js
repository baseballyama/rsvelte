import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import PixelCard from '$lib/components/library/Components/PixelCard/PixelCard.svelte';
import source from '$lib/components/library/Components/PixelCard/PixelCard.svelte?raw';

export default function PixelCardDemo($$renderer) {
	const DEFAULT = 'default';
	let variant = DEFAULT;
	const hasChanges = $.derived(() => variant !== DEFAULT);

	function reset() {
		variant = DEFAULT;
	}

	const usage = `<PixelCard variant="default">\n  <!-- content -->\n</PixelCard>`;

	const props = [
		{
			name: 'variant',
			type: '"default"|"blue"|"yellow"|"pink"',
			default: '"default"',
			description: 'Color scheme & animation style.'
		},

		{
			name: 'gap',
			type: 'number',
			default: 'varies',
			description: 'Pixel grid gap (px).'
		},

		{
			name: 'speed',
			type: 'number',
			default: 'varies',
			description: 'Animation speed modifier.'
		},

		{
			name: 'colors',
			type: 'string',
			default: '"#f8fafc,#f1f5f9,#cbd5e1"',
			description: 'Comma-separated palette.'
		},

		{
			name: 'noFocus',
			type: 'boolean',
			default: 'false',
			description: 'Disable focus trigger.'
		},

		{
			name: 'class',
			type: 'string',
			default: "''",
			description: 'Additional class for wrapper.'
		}
	];

	$.head('1ue4ftu', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Pixel Card - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Pixel Card</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;display:flex;align-items:center;justify-content:center;overflow:hidden;">`);

			PixelCard($$renderer, {
				variant,
				children: ($$renderer) => {
					$$renderer.push(`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;"><span style="font-size:3rem;font-weight:900;mix-blend-mode:screen;color:#222222;user-select:none;">Hover Me.</span></div>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'pixel-card', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSelect($$renderer, {
						title: 'Variant',
						options: ['default', 'yellow', 'blue', 'pink'],
						value: variant,
						onChange: (v) => variant = v
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
			componentName: 'PixelCard',
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