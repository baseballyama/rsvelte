import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BlockViewer from "$lib/components/block-viewer.svelte";
import ComponentPreview from "$lib/components/component-preview.svelte";
import { createFileTreeForRegistryItemFiles } from "$lib/registry/registry-utils.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<div class="flex flex-col gap-12 md:gap-24"><!> <div class="container-wrapper"><div class="container flex justify-center py-6"><!></div></div></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root();
	var node = $.child(div);

	$.each(node, 17, () => $$props.data.blocks, (block) => block.name, ($$anchor, block) => {
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
					ComponentPreview($$anchor, {
						get name() {
							return $.get(block).name;
						},
						hideCode: true,
						class: 'my-0 **:[.preview]:h-auto **:[.preview]:p-4 **:[.preview>.p-6]:p-0'
					});
				},
				$$slots: { default: true }
			});
		}
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var node_1 = $.child(div_2);

	Button(node_1, {
		href: '/blocks/sidebar',
		variant: 'outline',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Browse more blocks');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}