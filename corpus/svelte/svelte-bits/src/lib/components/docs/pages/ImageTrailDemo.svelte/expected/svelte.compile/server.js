import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import ImageTrail from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte';
import source from '$lib/components/library/Animations/ImageTrail/ImageTrail.svelte?raw';

export default function ImageTrailDemo($$renderer) {
	const items = Array.from({ length: 8 }, (_, i) => `https://picsum.photos/300/300?random=${i + 10}`);
	const DEFAULTS = { variant: 1 };
	let variant = DEFAULTS.variant;
	const hasChanges = $.derived(() => variant !== DEFAULTS.variant);

	function reset() {
		variant = DEFAULTS.variant;
	}

	const usage = $.derived(() => `<ImageTrail items={images} variant={${variant}} />`);

	const props = [
		{
			name: 'items',
			type: 'string[]',
			default: '[]',
			description: 'Image URLs to cycle through the trail.'
		},

		{
			name: 'variant',
			type: 'number',
			default: '1',
			description: 'Trail behavior variant (1-8).'
		}
	];

	$.head('1rvbtb9', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Image Trail - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Image Trail</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;"><!---->`);

			{
				ImageTrail($$renderer, { items, variant });
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'image-trail', usage: usage(), source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Variant',
						min: 1,
						max: 8,
						step: 1,
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
			componentName: 'ImageTrail',
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