import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
import EyeOffIcon from "@lucide/svelte/icons/eye-off";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'column',
	'title',
	'class'
]);

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<span> </span> <!>`, 1);
var root_2 = $.from_html(`<!> Asc`, 1);
var root_3 = $.from_html(`<!> Desc`, 1);
var root_4 = $.from_html(`<!> Hide`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<div><!></div>`);

export default function Data_table_column_header($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ class: $$props.class, ...restProps }));

			var text = $.only_child(div, true);

			$.template_effect(() => $.set_text(text, $$props.title));
			$.append($$anchor, div);
		};

		var d = $.derived(() => !$$props.column?.getCanSort());

		var alternate_1 = ($$anchor) => {
			var div_1 = root_7();

			$.attribute_effect(div_1, ($0) => ({ class: $0, ...restProps }), [() => cn("flex items-center", $$props.class)]);

			var node_1 = $.child(div_1);

			$.component(node_1, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = root_6();
						var node_2 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(props, {
									variant: 'ghost',
									size: 'sm',
									class: '-ms-3 h-8 data-[state=open]:bg-accent',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var span = $.first_child(fragment_3);
										var text_1 = $.only_child(span, true);
										var node_3 = $.sibling(span, 2);

										{
											var consequent_1 = ($$anchor) => {
												ArrowDownIcon($$anchor, {});
											};

											var d_1 = $.derived(() => $$props.column.getIsSorted() === "desc");

											var consequent_2 = ($$anchor) => {
												ArrowUpIcon($$anchor, {});
											};

											var d_2 = $.derived(() => $$props.column.getIsSorted() === "asc");

											var alternate = ($$anchor) => {
												ChevronsUpDownIcon($$anchor, {});
											};

											$.if(node_3, ($$render) => {
												if ($.get(d_1)) $$render(consequent_1); else if ($.get(d_2)) $$render(consequent_2, 1); else $$render(alternate, -1);
											});
										}

										$.template_effect(() => $.set_text(text_1, $$props.title));
										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_2, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
								DropdownMenu_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_4 = $.sibling(node_2, 2);

						$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
							DropdownMenu_Content($$anchor, {
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_5();
									var node_5 = $.first_child(fragment_7);

									$.component(node_5, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
										DropdownMenu_Item($$anchor, {
											onclick: () => $$props.column.toggleSorting(false),
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = root_2();
												var node_6 = $.first_child(fragment_8);

												ArrowUpIcon(node_6, { class: 'me-2 size-3.5 text-muted-foreground/70' });
												$.next();
												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									var node_7 = $.sibling(node_5, 2);

									$.component(node_7, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
										DropdownMenu_Item_1($$anchor, {
											onclick: () => $$props.column.toggleSorting(true),
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_3();
												var node_8 = $.first_child(fragment_9);

												ArrowDownIcon(node_8, { class: 'me-2 size-3.5 text-muted-foreground/70' });
												$.next();
												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_7, 2);

									$.component(node_9, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
										DropdownMenu_Separator($$anchor, {});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
										DropdownMenu_Item_2($$anchor, {
											onclick: () => $$props.column.toggleVisibility(false),
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = root_4();
												var node_11 = $.first_child(fragment_10);

												EyeOffIcon(node_11, { class: 'me-2 size-3.5 text-muted-foreground/70' });
												$.next();
												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}