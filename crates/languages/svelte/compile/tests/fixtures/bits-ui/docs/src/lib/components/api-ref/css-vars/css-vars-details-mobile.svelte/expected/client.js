import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Separator } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import { parseMarkdown } from "$lib/utils/index.js";
import PopoverContent from "$lib/components/ui/popover/popover-content.svelte";
import Info from "phosphor-svelte/lib/Info";

var root = $.from_html(`<!> <span class="sr-only">CSS Variable details</span>`, 1);
var root_1 = $.from_html(`<div class="w-full pr-[2.5px] leading-7"></div>`);
var root_2 = $.from_html(`<div class="flex w-full items-center"><span class="text-sm font-semibold"> </span></div> <!> <div class="flex w-full flex-col gap-2"><span class="text-foreground text-left font-semibold">Description</span> <!></div>`, 1);
var root_3 = $.from_html(`<!> <!> <span aria-hidden="true" class="hidden"></span>`, 1);

export default function Css_vars_details_mobile($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						'data-llm-ignore': true,
						class: 'rounded-button text-muted-foreground focus-visible:ring-foreground focus-visible:ring-offset-background extend-touch-target focus-visible:outline-hidden inline-flex h-full w-full items-center justify-end px-2 py-3 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							Info(node_2, { class: 'size-4', weight: 'bold' });
							$.next(2);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				PopoverContent(node_3, {
					preventScroll: false,
					side: 'left',
					sideOffset: 0,
					align: 'center',
					class: 'flex max-h-[80vh] w-[85vw] max-w-[85vw] flex-col gap-4',
					avoidCollisions: true,
					collisionPadding: { top: 70 },
					onCloseAutoFocus: (e) => e.preventDefault(),
					trapFocus: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var div = $.first_child(fragment_3);
						var span = $.child(div);
						var text = $.only_child(span, true);

						$.reset(div);

						var node_4 = $.sibling(div, 2);

						$.component(node_4, () => Separator.Root, ($$anchor, Separator_Root) => {
							Separator_Root($$anchor, { class: 'dark:bg-dark-10 bg-border !h-px w-full ' });
						});

						var div_1 = $.sibling(node_4, 2);
						var node_5 = $.sibling($.child(div_1), 2);

						ScrollArea(node_5, {
							type: 'scroll',
							class: 'text-foreground/85 max-h-[200px] min-w-full p-0 text-left text-sm leading-relaxed',
							scrollbarXProps: { class: "h-1.5" },
							scrollbarYProps: { class: "w-1.5 -mr-2" },
							children: ($$anchor, $$slotProps) => {
								var div_2 = root_1();

								$.html(div_2, () => parseMarkdown($$props.cssVar.description), true);
								$.reset(div_2);
								$.append($$anchor, div_2);
							},
							$$slots: { default: true }
						});

						$.reset(div_1);
						$.template_effect(() => $.set_text(text, $$props.cssVar.name));
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}