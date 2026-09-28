import * as $ from 'svelte/internal/server';
import BlockViewer from "$lib/components/block-viewer.svelte";
import ComponentPreview from "$lib/components/component-preview.svelte";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

function Placeholder($$renderer) {
	$$renderer.push(`<div class="mt-2 flex min-h-[331px] w-full items-center justify-center rounded-md border p-4">`);
	Skeleton($$renderer, { class: 'h-[297px] w-[250px]' });
	$$renderer.push(`<!----></div>`);
}

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
					$.await(
						$$renderer,
						block.component,
						() => {
							Placeholder($$renderer);
						},
						(component) => {
							ComponentPreview($$renderer, {
								name: block.name,
								component,
								hideCode: true,
								class: 'my-0 **:[.preview]:h-auto **:[.preview]:p-4 **:[.preview>.p-6]:p-0'
							});
						}
					);

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div>`);
	});
}