import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover } from "bits-ui";
import Code from "$lib/components/markdown/code.svelte";

var root = $.from_html(`<button class="bg-transparent">Copy to clipboard</button>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center gap-1.5"><!></div>`);

export default function Prop_copy($$anchor, $$props) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						class: 'rounded-button text-foreground-alt hover:text-foreground-alt/80 focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden inline-flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
						children: ($$anchor, $$slotProps) => {
							Code($$anchor, {
								class: 'bg-transparent px-0',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $$props.name));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						side: 'top',
						sideOffset: 10,
						class: 'rounded-input border-border bg-background shadow-popover z-50 max-h-[400px] overflow-auto border p-4',
						children: ($$anchor, $$slotProps) => {
							var button = root();

							$.append($$anchor, button);
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