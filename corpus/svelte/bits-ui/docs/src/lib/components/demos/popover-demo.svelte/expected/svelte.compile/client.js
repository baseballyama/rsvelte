import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover, Separator, Toggle } from "bits-ui";
import ImageSquare from "phosphor-svelte/lib/ImageSquare";
import LinkSimpleHorizontalBreak from "phosphor-svelte/lib/LinkSimpleHorizontalBreak";

var root = $.from_html(`<div class="flex items-center"><div class="bg-muted mr-3 flex size-12 items-center justify-center rounded-full"><!></div> <div class="flex flex-col"><h4 class="text-[17px] font-semibold leading-5 tracking-[-0.01em]">Resize image</h4> <p class="text-muted-foreground text-sm font-medium">Resize your photos easily</p></div></div> <!> <div class="flex items-center pb-2"><div class="mr-2 flex items-center"><div class="relative mr-2"><span class="sr-only">Width</span> <span aria-hidden="true" class="text-xxs text-muted-foreground absolute left-5 top-4">W</span> <input type="number" class="h-input rounded-10px border-border-input bg-background text-foreground w-[119px] border pl-10 pr-2 text-base sm:text-sm"/></div> <div class="relative"><span class="sr-only">Height</span> <span aria-hidden="true" class="text-xxs text-muted-foreground absolute left-5 top-4">H</span> <input type="number" class="h-input rounded-10px border-border-input bg-background text-foreground w-[119px] border pl-10 pr-2 text-base sm:text-sm"/></div></div> <!></div>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Popover_demo($$anchor) {
	let width = $.state(1024);
	let height = $.state(768);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						class: 'rounded-input bg-dark\n	text-background shadow-mini hover:bg-dark/95 inline-flex h-10 select-none items-center justify-center whitespace-nowrap px-[21px] text-[15px] font-medium transition-all hover:cursor-pointer active:scale-[0.98]',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Resize');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									class: 'border-dark-10 bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-popover-content-transform-origin) z-30 w-full max-w-[328px] rounded-[12px] border p-4',
									sideOffset: 8,
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root();
										var div = $.first_child(fragment_3);
										var div_1 = $.child(div);
										var node_4 = $.child(div_1);

										ImageSquare(node_4, { class: 'size-6' });
										$.reset(div_1);
										$.next(2);
										$.reset(div);

										var node_5 = $.sibling(div, 2);

										$.component(node_5, () => Separator.Root, ($$anchor, Separator_Root) => {
											Separator_Root($$anchor, { class: 'bg-dark-10 -mx-4 mb-6 mt-[17px] block h-px' });
										});

										var div_2 = $.sibling(node_5, 2);
										var div_3 = $.child(div_2);
										var div_4 = $.child(div_3);
										var input = $.sibling($.child(div_4), 4);

										$.remove_input_defaults(input);
										$.reset(div_4);

										var div_5 = $.sibling(div_4, 2);
										var input_1 = $.sibling($.child(div_5), 4);

										$.remove_input_defaults(input_1);
										$.reset(div_5);
										$.reset(div_3);

										var node_6 = $.sibling(div_3, 2);

										$.component(node_6, () => Toggle.Root, ($$anchor, Toggle_Root) => {
											Toggle_Root($$anchor, {
												'aria-label': 'toggle constrain portions',
												class: 'bg-background hover:bg-muted data-[state=on]:bg-muted inline-flex size-10 items-center justify-center rounded-[9px] transition-all active:scale-[0.98]',
												children: ($$anchor, $$slotProps) => {
													LinkSimpleHorizontalBreak($$anchor, { class: 'size-6' });
												},
												$$slots: { default: true }
											});
										});

										$.reset(div_2);
										$.bind_value(input, () => $.get(width), ($$value) => $.set(width, $$value));
										$.bind_value(input_1, () => $.get(height), ($$value) => $.set(height, $$value));
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
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