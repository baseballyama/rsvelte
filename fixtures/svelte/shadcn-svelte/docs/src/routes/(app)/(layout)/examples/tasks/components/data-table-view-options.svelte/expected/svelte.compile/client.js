import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Settings2Icon from "@lucide/svelte/icons/settings-2";
import * as DropdownMenu from "$lib/registry/ui/dropdown-menu/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> View`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Data_table_view_options($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => buttonVariants({
						variant: "outline",
						size: "sm",
						class: "ms-auto hidden h-8 lg:flex"
					}));

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								Settings2Icon(node_2, {});
								$.next();
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
								DropdownMenu_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
											DropdownMenu_Label($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text = $.text('Toggle columns');

													$.append($$anchor, text);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
											DropdownMenu_Separator($$anchor, {});
										});

										var node_7 = $.sibling(node_6, 2);

										$.each(node_7, 17, () => $$props.table.getAllColumns().filter((col) => typeof col.accessorFn !== "undefined" && col.getCanHide()), (column) => column.id, ($$anchor, column) => {
											var fragment_5 = $.comment();
											var node_8 = $.first_child(fragment_5);
											var bind_get = () => $.get(column).getIsVisible();
											var bind_set = (v) => $.get(column).toggleVisibility(!!v);

											$.component(node_8, () => DropdownMenu.CheckboxItem, ($$anchor, DropdownMenu_CheckboxItem) => {
												DropdownMenu_CheckboxItem($$anchor, {
													get checked() {
														return bind_get();
													},

													set checked($$value) {
														bind_set($$value);
													},
													class: 'capitalize',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, $.get(column).id));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										});

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
	$.pop();
}