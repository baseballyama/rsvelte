import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as RadioGroup from "$lib/registry/ui/radio-group/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div> <div class="flex items-center space-x-2"><!> <!></div>`, 1);

export default function Radio_group_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
		RadioGroup_Root($$anchor, {
			value: 'comfortable',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				$.component(node_1, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
					RadioGroup_Item($$anchor, { value: 'default', id: 'r1' });
				});

				var node_2 = $.sibling(node_1, 2);

				Label(node_2, {
					for: 'r1',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_3 = $.child(div_1);

				$.component(node_3, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
					RadioGroup_Item_1($$anchor, { value: 'comfortable', id: 'r2' });
				});

				var node_4 = $.sibling(node_3, 2);

				Label(node_4, {
					for: 'r2',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Comfortable');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_5 = $.child(div_2);

				$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
					RadioGroup_Item_2($$anchor, { value: 'compact', id: 'r3' });
				});

				var node_6 = $.sibling(node_5, 2);

				Label(node_6, {
					for: 'r3',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Compact');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}