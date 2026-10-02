import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, RadioGroup } from "bits-ui";

var root = $.from_html(`<div class="text-foreground group flex select-none items-center transition-all"><!> <!></div> <div class="text-foreground group flex select-none items-center transition-all"><!> <!></div> <div class="text-foreground group flex select-none items-center transition-all"><!> <!></div>`, 1);

export default function Radio_group_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => RadioGroup.Root, ($$anchor, RadioGroup_Root) => {
		RadioGroup_Root($$anchor, {
			class: 'flex flex-col gap-4 text-sm font-medium',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var node_1 = $.child(div);

				$.component(node_1, () => RadioGroup.Item, ($$anchor, RadioGroup_Item) => {
					RadioGroup_Item($$anchor, {
						id: 'amazing',
						value: 'amazing',
						class: 'border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-6 size-5 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out'
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Label.Root, ($$anchor, Label_Root) => {
					Label_Root($$anchor, {
						for: 'amazing',
						class: 'pl-3',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Amazing');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var div_1 = $.sibling(div, 2);
				var node_3 = $.child(div_1);

				$.component(node_3, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_1) => {
					RadioGroup_Item_1($$anchor, {
						id: 'average',
						value: 'average',
						class: 'border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-6 size-5 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out'
					});
				});

				var node_4 = $.sibling(node_3, 2);

				$.component(node_4, () => Label.Root, ($$anchor, Label_Root_1) => {
					Label_Root_1($$anchor, {
						for: 'average',
						class: 'pl-3',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Average');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var div_2 = $.sibling(div_1, 2);
				var node_5 = $.child(div_2);

				$.component(node_5, () => RadioGroup.Item, ($$anchor, RadioGroup_Item_2) => {
					RadioGroup_Item_2($$anchor, {
						id: 'terrible',
						value: 'terrible',
						class: 'border-border-input bg-background hover:border-dark-40 data-[state=checked]:border-foreground data-[state=checked]:border-6 size-5 shrink-0 cursor-default rounded-full border transition-all duration-100 ease-in-out'
					});
				});

				var node_6 = $.sibling(node_5, 2);

				$.component(node_6, () => Label.Root, ($$anchor, Label_Root_2) => {
					Label_Root_2($$anchor, {
						for: 'terrible',
						class: 'pl-3',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Terrible');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}