import * as $ from 'svelte/internal/server';
import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
import Customize from '$lib/components/docs/preview/Customize.svelte';
import PropTable from '$lib/components/docs/preview/PropTable.svelte';
import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
import InfiniteMenu from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte';
import source from '$lib/components/library/Components/InfiniteMenu/InfiniteMenu.svelte?raw';

export default function InfiniteMenuDemo($$renderer) {
	const DEFAULTS = { scale: 1.0 };
	let scale = DEFAULTS.scale;
	let key = 0;
	const hasChanges = $.derived(() => scale !== DEFAULTS.scale);

	function reset() {
		scale = DEFAULTS.scale;
		key++;
	}

	const items = [
		{
			image: 'https://picsum.photos/300/300?grayscale',
			link: 'https://google.com/',
			title: 'Item 1',
			description: 'This is pretty cool, right?'
		},

		{
			image: 'https://picsum.photos/400/400?grayscale',
			link: 'https://google.com/',
			title: 'Item 2',
			description: 'This is pretty cool, right?'
		},

		{
			image: 'https://picsum.photos/500/500?grayscale',
			link: 'https://google.com/',
			title: 'Item 3',
			description: 'This is pretty cool, right?'
		},

		{
			image: 'https://picsum.photos/600/600?grayscale',
			link: 'https://google.com/',
			title: 'Item 4',
			description: 'This is pretty cool, right?'
		}
	];

	const usage = `<InfiniteMenu items={items} scale={1} />`;

	const props = [
		{
			name: 'items',
			type: 'InfiniteMenuItem[]',
			default: '[{...}]',
			description: 'Items with image, link, title, description.'
		},

		{
			name: 'scale',
			type: 'number',
			default: '1.0',
			description: 'Camera zoom.'
		}
	];

	$.head('1itm5d5', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Infinite Menu - svelte-bits</title>`);
		});
	});

	$$renderer.push(`<h1 class="sub-category">Infinite Menu</h1> `);

	{
		function preview($$renderer) {
			$$renderer.push(`<div class="demo-container" style="position:relative;height:500px;overflow:hidden;padding:0;"><!---->`);

			{
				$$renderer.push(`<div style="height:500px;width:100%;overflow:hidden;">`);
				InfiniteMenu($$renderer, { items, scale });
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!----></div>`);
		}

		function code($$renderer) {
			DemoCodeTab($$renderer, { slug: 'infinite-menu', usage, source });
		}

		function customize($$renderer) {
			Customize($$renderer, {
				children: ($$renderer) => {
					PreviewSlider($$renderer, {
						title: 'Scale',
						min: 0.1,
						max: 3,
						step: 0.1,
						value: scale,
						onChange: (v) => scale = v
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
			componentName: 'InfiniteMenu',
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