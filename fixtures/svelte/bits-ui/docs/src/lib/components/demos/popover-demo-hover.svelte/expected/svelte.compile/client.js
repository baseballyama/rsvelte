import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Popover, Separator } from "bits-ui";
import MapPin from "phosphor-svelte/lib/MapPin";
import Calendar from "phosphor-svelte/lib/Calendar";

var root = $.from_html(`<img src="https://github.com/huntabyte.png" alt="" class="size-6 rounded-full object-cover"/> huntabyte`, 1);
var root_1 = $.from_html(`<div class="flex items-start justify-between gap-3"><div class="flex items-start gap-3"><div class="bg-muted flex size-12 shrink-0 items-center justify-center rounded-full"><img src="https://github.com/huntabyte.png" alt="Hunter Johnston" class="size-full rounded-full object-cover"/></div> <div class="flex flex-col gap-0.5"><span class="text-[15px] font-semibold leading-5">Hunter Johnston</span> <span class="text-muted-foreground text-sm">@huntabyte</span></div></div> <!></div> <p class="text-foreground/90 mt-3 text-sm leading-relaxed">Building Bits UI and other open source tools for the Svelte ecosystem.</p> <!> <div class="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs"><span class="inline-flex items-center gap-1"><!> FL, USA</span> <span class="inline-flex items-center gap-1"><!> Joined 2020</span></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Popover_demo_hover($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						openOnHover: true,
						openDelay: 200,
						closeDelay: 100,
						class: 'bg-muted hover:bg-muted/80 inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();

							$.next();
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Portal, ($$anchor, Popover_Portal) => {
					Popover_Portal($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_3 = $.first_child(fragment_3);

							$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
								Popover_Content($$anchor, {
									class: 'border-dark-10 bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--bits-popover-content-transform-origin) z-30 w-full max-w-[300px] rounded-[12px] border p-4 focus-visible:outline-none',
									sideOffset: 8,
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var div = $.first_child(fragment_4);
										var node_4 = $.sibling($.child(div), 2);

										$.component(node_4, () => Button.Root, ($$anchor, Button_Root) => {
											Button_Root($$anchor, {
												href: 'https://x.com/huntabyte',
												target: '_blank',
												class: 'bg-dark text-background shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-opacity hover:opacity-90',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Follow');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										$.reset(div);

										var node_5 = $.sibling(div, 4);

										$.component(node_5, () => Separator.Root, ($$anchor, Separator_Root) => {
											Separator_Root($$anchor, { class: 'bg-dark-10 -mx-4 my-3 block h-px' });
										});

										var div_1 = $.sibling(node_5, 2);
										var span = $.child(div_1);
										var node_6 = $.child(span);

										MapPin(node_6, { class: 'size-3.5' });
										$.next();
										$.reset(span);

										var span_1 = $.sibling(span, 2);
										var node_7 = $.child(span_1);

										Calendar(node_7, { class: 'size-3.5' });
										$.next();
										$.reset(span_1);
										$.reset(div_1);
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

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