import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<div class="grid gap-4"><div class="space-y-2"><h4 class="leading-none font-medium">Dimensions</h4> <p class="text-sm text-muted-foreground">Set the dimensions for the layer.</p></div> <div class="grid gap-2"><div class="grid grid-cols-3 items-center gap-4"><!> <!></div> <div class="grid grid-cols-3 items-center gap-4"><!> <!></div> <div class="grid grid-cols-3 items-center gap-4"><!> <!></div> <div class="grid grid-cols-3 items-center gap-4"><!> <!></div></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Popover_demo($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Open popover');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-80',
						children: ($$anchor, $$slotProps) => {
							var div = root();
							var div_1 = $.sibling($.child(div), 2);
							var div_2 = $.child(div_1);
							var node_3 = $.child(div_2);

							Label(node_3, {
								for: 'width',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Width');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Input(node_4, { id: 'width', value: '100%', class: 'col-span-2 h-8' });
							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_5 = $.child(div_3);

							Label(node_5, {
								for: 'maxWidth',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Max. width');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							Input(node_6, { id: 'maxWidth', value: '300px', class: 'col-span-2 h-8' });
							$.reset(div_3);

							var div_4 = $.sibling(div_3, 2);
							var node_7 = $.child(div_4);

							Label(node_7, {
								for: 'height',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text('Height');

									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});

							var node_8 = $.sibling(node_7, 2);

							Input(node_8, { id: 'height', value: '25px', class: 'col-span-2 h-8' });
							$.reset(div_4);

							var div_5 = $.sibling(div_4, 2);
							var node_9 = $.child(div_5);

							Label(node_9, {
								for: 'maxHeight',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Max. height');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							var node_10 = $.sibling(node_9, 2);

							Input(node_10, { id: 'maxHeight', value: 'none', class: 'col-span-2 h-8' });
							$.reset(div_5);
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
	$.pop();
}