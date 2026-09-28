import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import { Kbd } from "$lib/registry/ui/kbd/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

var root = $.from_html(`<div class="flex flex-col gap-3"><div class="text-sm font-medium">Shortcuts</div> <div class="flex flex-col gap-2"><div class="flex items-center justify-between text-sm text-muted-foreground"><span>Search</span> <div class="flex gap-1"><!> <!></div></div> <!> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>Quick Actions</span> <div class="flex gap-1"><!> <!></div></div> <!> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>New File</span> <div class="flex gap-1"><!> <!></div></div> <!> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>Save</span> <div class="flex gap-1"><!> <!></div></div> <!> <div class="flex items-center justify-between text-sm text-muted-foreground"><span>Toggle Sidebar</span> <div class="flex gap-1"><!> <!></div></div></div></div>`);

export default function Shortcuts($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div = root();
							var div_1 = $.sibling($.child(div), 2);
							var div_2 = $.child(div_1);
							var div_3 = $.sibling($.child(div_2), 2);
							var node_2 = $.child(div_3);

							Kbd(node_2, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('⌘');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							Kbd(node_3, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('K');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.reset(div_3);
							$.reset(div_2);

							var node_4 = $.sibling(div_2, 2);

							Separator(node_4, {});

							var div_4 = $.sibling(node_4, 2);
							var div_5 = $.sibling($.child(div_4), 2);
							var node_5 = $.child(div_5);

							Kbd(node_5, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('⌘');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Kbd(node_6, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('J');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							$.reset(div_5);
							$.reset(div_4);

							var node_7 = $.sibling(div_4, 2);

							Separator(node_7, {});

							var div_6 = $.sibling(node_7, 2);
							var div_7 = $.sibling($.child(div_6), 2);
							var node_8 = $.child(div_7);

							Kbd(node_8, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('⌘');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_9 = $.sibling(node_8, 2);

							Kbd(node_9, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_5 = $.text('N');

									$.append($$anchor, text_5);
								},
								$$slots: { default: true }
							});

							$.reset(div_7);
							$.reset(div_6);

							var node_10 = $.sibling(div_6, 2);

							Separator(node_10, {});

							var div_8 = $.sibling(node_10, 2);
							var div_9 = $.sibling($.child(div_8), 2);
							var node_11 = $.child(div_9);

							Kbd(node_11, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text('⌘');

									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							Kbd(node_12, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('S');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});

							$.reset(div_9);
							$.reset(div_8);

							var node_13 = $.sibling(div_8, 2);

							Separator(node_13, {});

							var div_10 = $.sibling(node_13, 2);
							var div_11 = $.sibling($.child(div_10), 2);
							var node_14 = $.child(div_11);

							Kbd(node_14, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('⌘');

									$.append($$anchor, text_8);
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							Kbd(node_15, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_9 = $.text('B');

									$.append($$anchor, text_9);
								},
								$$slots: { default: true }
							});

							$.reset(div_11);
							$.reset(div_10);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, div);
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