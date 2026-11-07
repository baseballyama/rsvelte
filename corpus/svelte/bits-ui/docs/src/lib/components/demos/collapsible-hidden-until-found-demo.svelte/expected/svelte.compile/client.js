import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible } from "bits-ui";
import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";

var root = $.from_html(`<div class="bg-background border-border rounded-lg border p-4 text-[14px] leading-relaxed"><p class="mb-3">This collapsible contains <strong>searchable content</strong> that demonstrates
					the <code class="bg-muted rounded px-1 py-0.5 text-xs">hiddenUntilFound</code> feature.
					When you search for text within this collapsed section, the browser will automatically
					expand it to show the matching results.</p></div>`);

var root_1 = $.from_html(`<div class="flex items-center justify-between gap-4"><h4 class="text-[15px] font-medium">FAQ: How does search work?</h4> <!></div> <!>`, 1);
var root_2 = $.from_html(`<div class="flex w-full max-w-md flex-col gap-4"><div class="border-border bg-background-alt absolute left-4 top-4 flex flex-col gap-2 rounded-xl border p-4"><div class="text-foreground-alt flex flex-col gap-2 text-sm"><span>Try searching for "searchable content" on this page</span> <code class="bg-muted w-fit rounded px-1 py-0.5 text-xs">(Ctrl+F / Cmd+F)</code></div></div> <!></div>`);

export default function Collapsible_hidden_until_found_demo($$anchor) {
	var div = root_2();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
		Collapsible_Root($$anchor, {
			class: 'flex flex-col gap-3',
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var div_1 = $.first_child(fragment);
				var node_1 = $.sibling($.child(div_1), 2);

				$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
					Collapsible_Trigger($$anchor, {
						class: 'rounded-9px border-border-input bg-background-alt text-foreground shadow-btn hover:bg-muted inline-flex h-10 w-10 items-center justify-center border transition-all active:scale-[0.98]',
						'aria-label': 'Toggle FAQ answer',
						children: ($$anchor, $$slotProps) => {
							CaretUpDown($$anchor, { class: 'size-4', weight: 'bold' });
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var node_2 = $.sibling(div_1, 2);

				$.component(node_2, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
					Collapsible_Content($$anchor, {
						hiddenUntilFound: true,
						class: 'data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden',
						children: ($$anchor, $$slotProps) => {
							var div_2 = root();

							$.append($$anchor, div_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}