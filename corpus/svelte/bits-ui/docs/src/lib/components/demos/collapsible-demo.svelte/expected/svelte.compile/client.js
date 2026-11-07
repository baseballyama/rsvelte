import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";

var root = $.from_html(`<div class="rounded-9px bg-muted inline-flex h-12 w-full items-center px-[18px] py-3">@huntabyte/bits-ui</div> <div class="rounded-9px bg-muted inline-flex h-12 w-full items-center px-[18px] py-3">@huntabyte/shadcn-svelte</div> <div class="rounded-9px bg-muted inline-flex h-12 w-full items-center px-[18px] py-3">@svecosystem/runed</div>`, 1);
var root_1 = $.from_html(`<div class="flex items-center justify-between space-x-10"><h4 class="text-[15px] font-medium">@huntabyte starred 3 repositories</h4> <!></div> <!>`, 1);

export default function Collapsible_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
		Collapsible_Root($$anchor, {
			class: 'w-[327px] space-y-3',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var div = $.first_child(fragment_1);
				var node_1 = $.sibling($.child(div), 2);

				$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
					Collapsible_Trigger($$anchor, {
						class: 'rounded-9px border-border-input bg-background-alt text-foreground shadow-btn hover:bg-muted inline-flex h-10 w-10 items-center justify-center border transition-all active:scale-[0.98]',
						'aria-label': 'Show starred repositories',
						children: ($$anchor, $$slotProps) => {
							CaretUpDown($$anchor, { class: 'size-4', weight: 'bold' });
						},
						$$slots: { default: true }
					});
				});

				$.reset(div);

				var node_2 = $.sibling(div, 2);

				$.component(node_2, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
					Collapsible_Content($$anchor, {
						hiddenUntilFound: true,
						class: 'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up space-y-2 overflow-hidden font-mono text-[15px] tracking-[0.01em]',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();

							$.next(4);
							$.append($$anchor, fragment_3);
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