import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BlockViewer from "$lib/components/block-viewer.svelte";
import ComponentPreview from "$lib/components/component-preview.svelte";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
import { Skeleton } from "$lib/registry/ui/skeleton/index.js";

const Placeholder = ($$anchor) => {
	var div = root();
	var node = $.child(div);

	Skeleton(node, { class: 'h-[297px] w-[250px]' });
	$.reset(div);
	$.append($$anchor, div);
};

var root = $.from_html(`<div class="mt-2 flex min-h-[331px] w-full items-center justify-center rounded-md border p-4"><!></div>`);
var root_1 = $.from_html(`<div class="flex flex-col gap-12 md:gap-24"></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div_1 = root_1();

	$.each(div_1, 21, () => $$props.data.blocks, (block) => block.name, ($$anchor, block) => {
		{
			let $0 = $.derived(() => createFileTreeForRegistryItemFiles($.get(block).files));

			BlockViewer($$anchor, {
				get item() {
					return $.get(block);
				},

				get tree() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.await(
						node_1,
						() => $.get(block).component,
						($$anchor) => {
							Placeholder($$anchor);
						},
						($$anchor, component) => {
							ComponentPreview($$anchor, {
								get name() {
									return $.get(block).name;
								},

								get component() {
									return $.get(component);
								},
								hideCode: true,
								class: 'my-0 **:[.preview]:h-auto **:[.preview]:p-4 **:[.preview>.p-6]:p-0'
							});
						}
					);

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		}
	});

	$.reset(div_1);
	$.append($$anchor, div_1);
	$.pop();
}