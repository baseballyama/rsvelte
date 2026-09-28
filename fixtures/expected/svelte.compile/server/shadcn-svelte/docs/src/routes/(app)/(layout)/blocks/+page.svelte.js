import * as $ from 'svelte/internal/server';
import BlockViewer from "$lib/components/block-viewer.svelte";
import ComponentPreview from "$lib/components/component-preview.svelte";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		$$renderer.push(`<div class="flex flex-col gap-12 md:gap-24"><!--[-->`);

		const each_array = $.ensure_array_like(data.blocks);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let block = each_array[$$index];

			BlockViewer($$renderer, {
				item: block,
				tree: createFileTreeForRegistryItemFiles(block.files),
				children: ($$renderer) => {
					ComponentPreview($$renderer, {
						name: block.name,
						hideCode: true,
						class: 'my-0 **:[.preview]:h-auto **:[.preview]:p-4 **:[.preview>.p-6]:p-0'
					});
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--> <div class="container-wrapper"><div class="container flex justify-center py-6">`);

		Button($$renderer, {
			href: '/blocks/sidebar',
			variant: 'outline',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Browse more blocks`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div></div>`);
	});
}