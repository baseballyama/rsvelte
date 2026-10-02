import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-4"><!></div>`);

export default function Button_group_with_icons($$anchor) {
	Example($$anchor, {
		title: 'With Icons',
		children: ($$anchor, $$slotProps) => {
			var div = root_1();
			var node = $.child(div);

			ButtonGroup(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					Button(node_1, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							IconPlaceholder($$anchor, {
								lucide: 'FlipHorizontalIcon',
								tabler: 'IconFlipHorizontal',
								hugeicons: 'FlipHorizontalIcon',
								phosphor: 'ArrowsHorizontalIcon',
								remixicon: 'RiFlipHorizontalLine'
							});
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							IconPlaceholder($$anchor, {
								lucide: 'FlipVerticalIcon',
								tabler: 'IconFlipVertical',
								hugeicons: 'FlipVerticalIcon',
								phosphor: 'ArrowsVerticalIcon',
								remixicon: 'RiFlipVerticalLine'
							});
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						variant: 'outline',
						children: ($$anchor, $$slotProps) => {
							IconPlaceholder($$anchor, {
								lucide: 'RotateCwIcon',
								tabler: 'IconRotateClockwise2',
								hugeicons: 'Rotate01Icon',
								phosphor: 'ArrowClockwiseIcon',
								remixicon: 'RiRefreshLine'
							});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}