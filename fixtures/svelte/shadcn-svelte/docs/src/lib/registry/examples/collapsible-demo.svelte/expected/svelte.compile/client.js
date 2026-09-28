import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import * as Collapsible from "$lib/registry/ui/collapsible/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <span class="sr-only">Toggle</span>`, 1);
var root_1 = $.from_html(`<div class="rounded-md border px-4 py-3 font-mono text-sm">@melt-ui/melt-ui</div> <div class="rounded-md border px-4 py-3 font-mono text-sm">@sveltejs/svelte</div>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between space-x-4 px-4"><h4 class="text-sm font-semibold">@huntabyte starred 3 repositories</h4> <!></div> <div class="rounded-md border px-4 py-3 font-mono text-sm">@huntabyte/bits-ui</div> <!>`, 1);

export default function Collapsible_demo($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
		Collapsible_Root($$anchor, {
			class: 'w-[350px] space-y-2',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var div = $.first_child(fragment_1);
				var node_1 = $.sibling($.child(div), 2);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "ghost", size: "sm", class: "w-9 p-0" }));

					$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
						Collapsible_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								ChevronsUpDownIcon(node_2, {});
								$.next(2);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				$.reset(div);

				var node_3 = $.sibling(div, 4);

				$.component(node_3, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
					Collapsible_Content($$anchor, {
						class: 'space-y-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();

							$.next(2);
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
	$.pop();
}