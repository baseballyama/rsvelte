import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToggleGroup } from "bits-ui";
import TextB from "phosphor-svelte/lib/TextB";
import TextItalic from "phosphor-svelte/lib/TextItalic";
import TextStrikethrough from "phosphor-svelte/lib/TextStrikethrough";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Toggle_group_demo($$anchor) {
	let value = $.state($.proxy(["bold"]));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
		ToggleGroup_Root($$anchor, {
			type: 'multiple',
			class: 'h-input rounded-card-sm border-border bg-background-alt shadow-mini flex items-center gap-x-0.5 border px-[4px] py-1',
			get value() {
				return $.get(value);
			},

			set value($$value) {
				$.set(value, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
					ToggleGroup_Item($$anchor, {
						'aria-label': 'toggle bold',
						value: 'bold',
						class: 'rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							TextB($$anchor, { class: 'size-6' });
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
					ToggleGroup_Item_1($$anchor, {
						'aria-label': 'toggle italic',
						value: 'italic',
						class: 'rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							TextItalic($$anchor, { class: 'size-6' });
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
					ToggleGroup_Item_2($$anchor, {
						'aria-label': 'toggle strikethrough',
						value: 'strikethrough',
						class: 'rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex size-10 items-center justify-center transition-all active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							TextStrikethrough($$anchor, { class: 'size-6' });
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}