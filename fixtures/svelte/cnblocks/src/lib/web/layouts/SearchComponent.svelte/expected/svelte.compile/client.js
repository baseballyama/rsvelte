import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { goto } from "$app/navigation";
import Button from "$lib/components/ui/button/button.svelte";
import * as Command from "$lib/components/ui/command/index";
import { search_comp } from "$lib/config/search_comp";
import { cn } from "$lib/utils";
import Circle from "@lucide/svelte/icons/circle";
import { onMount } from "svelte";

var root = $.from_html(`<span class="hidden lg:inline-flex">Search Component..</span> <span class="inline-flex lg:hidden">Search...</span>`, 1);
var root_1 = $.from_html(`<div class="mr-2 flex h-4 w-4 items-center justify-center"><!></div> `, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function SearchComponent($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);

	onMount(() => {
		function handleKeydown(e) {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				$.set(open, true);
			}
		}

		document.addEventListener("keydown", handleKeydown);

		return () => {
			document.removeEventListener("keydown", handleKeydown);
		};
	});

	function runCommand(cmd) {
		$.set(open, false);
		cmd();
	}

	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("rounded-full text-muted-foreground md:w-40 lg:w-40"));

		Button(node, {
			variant: 'outline',
			get class() {
				return $.get($0);
			},
			onclick: () => $.set(open, true),
			size: 'sm',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();

				$.next(2);
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Command.Dialog, ($$anchor, Command_Dialog) => {
		Command_Dialog($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_2 = root_2();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => Command.Input, ($$anchor, Command_Input) => {
					Command_Input($$anchor, { placeholder: 'Type a component name..' });
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Command.List, ($$anchor, Command_List) => {
					Command_List($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => Command.Empty, ($$anchor, Command_Empty) => {
								Command_Empty($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('No results found.');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.each(node_5, 17, () => search_comp, $.index, ($$anchor, navItem) => {
								var fragment_4 = $.comment();
								var node_6 = $.first_child(fragment_4);

								$.component(node_6, () => Command.Group, ($$anchor, Command_Group) => {
									Command_Group($$anchor, {
										get heading() {
											return $.get(navItem).name;
										},

										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_7 = $.first_child(fragment_5);

											$.each(node_7, 17, () => $.get(navItem).subcom, $.index, ($$anchor, item) => {
												var fragment_6 = $.comment();
												var node_8 = $.first_child(fragment_6);

												$.component(node_8, () => Command.Item, ($$anchor, Command_Item) => {
													Command_Item($$anchor, {
														class: 'capitalize',
														get value() {
															return $.get(item).name;
														},

														onSelect: () => runCommand(() => {
															$.get(item).href && goto($.get(item).href);
														}),

														children: ($$anchor, $$slotProps) => {
															var fragment_7 = root_1();
															var div = $.first_child(fragment_7);
															var node_9 = $.child(div);

															Circle(node_9, { class: 'h-3 w-3' });
															$.reset(div);

															var text_1 = $.sibling(div);

															$.template_effect(() => $.set_text(text_1, ` ${$.get(item).name ?? ''}`));
															$.append($$anchor, fragment_7);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_6);
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							});

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

	$.append($$anchor, fragment);
	$.pop();
}