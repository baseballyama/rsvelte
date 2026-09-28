import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CopyIcon from "@lucide/svelte/icons/copy";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button, buttonVariants } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<span class="sr-only">Copy</span> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col space-y-2 text-center sm:text-start"><h3 class="text-lg font-semibold">Share preset</h3> <p class="text-sm text-muted-foreground">Anyone who has this link and an OpenAI account will be able to view this.</p></div> <div class="flex items-center space-x-2 pt-4"><div class="grid flex-1 gap-2"><!> <!></div> <!></div>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Preset_share($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({ variant: "secondary" }));

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('Share');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-[520px]',
						align: 'end',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var div = $.sibling($.first_child(fragment_2), 2);
							var div_1 = $.child(div);
							var node_3 = $.child(div_1);

							Label(node_3, {
								for: 'link',
								class: 'sr-only',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('Link');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							Input(node_4, {
								id: 'link',
								value: 'https://platform.openai.com/playground/p/7bbKYQvsVkNmVb8NGcdUOLae?model=text-davinci-003',
								readonly: true,
								class: 'h-9'
							});

							$.reset(div_1);

							var node_5 = $.sibling(div_1, 2);

							Button(node_5, {
								type: 'submit',
								size: 'sm',
								class: 'px-3',
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_6 = $.sibling($.first_child(fragment_3), 2);

									CopyIcon(node_6, {});
									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});

							$.reset(div);
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
	$.pop();
}