import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Separator } from "bits-ui";
import ScrollArea from "$lib/components/ui/scroll-area.svelte";
import Info from "phosphor-svelte/lib/Info";
import Code from "$lib/components/markdown/code.svelte";
import { parseMarkdown } from "$lib/utils/markdown.js";
import PopoverContent from "$lib/components/ui/popover/popover-content.svelte";

var root = $.from_html(`<!> <span class="sr-only">See type definition</span>`, 1);
var root_1 = $.from_html(`<div class="**:data-line:pr-2.5! [&amp;_pre]:my-0! [&amp;_pre]:mb-0! [&amp;_pre]:overflow-x-visible! [&amp;_pre]:pt-0! [&amp;_pre]:pb-0! [&amp;_pre]:ring-0! [&amp;_pre]:ring-offset-0! [&amp;_pre]:outline-hidden! w-full !text-xs [&amp;_[data-line]]:!pl-0 [&amp;_[data-line]]:!text-xs [&amp;_code]:text-start [&amp;_pre]:mt-0 [&amp;_pre]:border-0 [&amp;_pre]:p-0"><!></div>`);
var root_2 = $.from_html(`<div class="w-full pr-[2.5px] leading-7"></div>`);
var root_3 = $.from_html(`<div class="flex w-full"><span class="font-semibold"> </span></div> <!> <!> <div class="flex w-full flex-col gap-2"><span class="text-foreground text-left font-semibold">Description</span> <!></div>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Data_attrs_value_content_mobile($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
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
					sideOffset: -6,
					align: 'center',
					class: 'flex max-h-[80vh] w-[85vw] max-w-[85vw] flex-col gap-4',
					avoidCollisions: true,
					collisionPadding: { top: 70 },
					onCloseAutoFocus: (e) => e.preventDefault(),
					trapFocus: false,
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_3();
						var div = $.first_child(fragment_3);
						var span = $.child(div);
						var text = $.only_child(span);

						$.reset(div);

						var node_4 = $.sibling(div, 2);

						{
							var consequent = ($$anchor) => {
								Code($$anchor, {
									class: 'h-auto w-full justify-start px-2 py-2 text-start text-sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $$props.attr.value));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							};

							var alternate = ($$anchor) => {
								ScrollArea($$anchor, {
									type: 'scroll',
									class: 'bg-muted rounded-button flex max-h-[200px] min-w-full p-2',
									scrollbarXProps: { class: "h-1.5" },
									scrollbarYProps: { class: "w-1.5" },
									children: ($$anchor, $$slotProps) => {
										var div_1 = root_1();
										var node_5 = $.child(div_1);

										$.component(node_5, () => $$props.attr.value, ($$anchor, attr_value) => {
											attr_value($$anchor, {});
										});

										$.reset(div_1);
										$.append($$anchor, div_1);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_4, ($$render) => {
								if ($$props.attr.variant === "simple") $$render(consequent); else $$render(alternate, -1);
							});
						}

						var node_6 = $.sibling(node_4, 2);

						$.component(node_6, () => Separator.Root, ($$anchor, Separator_Root) => {
							Separator_Root($$anchor, { class: 'dark:bg-dark-10 bg-border !h-px w-full ' });
						});

						var div_2 = $.sibling(node_6, 2);
						var node_7 = $.sibling($.child(div_2), 2);

						ScrollArea(node_7, {
							type: 'scroll',
							class: 'text-foreground/85 max-h-[200px] min-w-full p-0 text-left text-sm leading-relaxed',
							scrollbarXProps: { class: "h-1.5" },
							scrollbarYProps: { class: "w-1.5 -mr-2" },
							children: ($$anchor, $$slotProps) => {
								var div_3 = root_2();

								$.html(div_3, () => parseMarkdown($$props.attr.description), true);
								$.reset(div_3);
								$.append($$anchor, div_3);
							},
							$$slots: { default: true }
						});

						$.reset(div_2);
						$.template_effect(() => $.set_text(text, `data-${$$props.attr.name ?? ''}`));
						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}