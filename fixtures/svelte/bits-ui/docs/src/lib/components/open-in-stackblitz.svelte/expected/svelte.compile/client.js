import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { openInStackBlitz } from "$lib/utils/open-in-stackblitz.js";
import Stackblitz from "$icons/stackblitz.svelte";
import { Tooltip } from "bits-ui";

var root = $.from_html(`<div class="rounded-input border-dark-10 bg-background shadow-popover outline-hidden z-0 flex select-none items-center justify-center border p-3 text-xs">Open in StackBlitz</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="absolute bottom-2 right-2"><!></div>`);

export default function Open_in_stackblitz($$anchor, $$props) {
	$.push($$props, true);

	let componentName = $.prop($$props, 'componentName', 19, () => $$props.demoName);
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => Tooltip.Provider, ($$anchor, Tooltip_Provider) => {
		Tooltip_Provider($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
					Tooltip_Root($$anchor, {
						delayDuration: 0,
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, {
									onclick: () => openInStackBlitz($$props.demoName, componentName()),
									class: 'ring-dark ring-offset-background hover:bg-muted focus-visible:ring-dark focus-visible:ring-offset-background focus-visible:outline-hidden group inline-flex size-9 cursor-pointer items-center justify-center rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2',
									children: ($$anchor, $$slotProps) => {
										Stackblitz($$anchor, {
											class: 'text-foreground/30 group-hover:text-foreground size-[18px]'
										});
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
								Tooltip_Content($$anchor, {
									sideOffset: 4,
									children: ($$anchor, $$slotProps) => {
										var div_1 = root();

										$.append($$anchor, div_1);
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
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}