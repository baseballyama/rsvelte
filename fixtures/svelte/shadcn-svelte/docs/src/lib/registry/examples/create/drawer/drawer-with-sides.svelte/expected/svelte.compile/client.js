import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<p class="mb-4 leading-normal style-lyra:mb-2 style-lyra:leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
								incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
								exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
								irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
								pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
								deserunt mollit anim id est laborum.</p>`);

var root_2 = $.from_html(`<!> <div class="no-scrollbar overflow-y-auto px-4"></div> <!>`, 1);
var root_3 = $.from_html(`<div class="flex flex-wrap gap-2"></div>`);

export default function Drawer_with_sides($$anchor) {
	const DRAWER_SIDES = ["top", "right", "bottom", "left"];

	Example($$anchor, {
		title: 'Sides',
		children: ($$anchor, $$slotProps) => {
			var div = root_3();

			$.each(div, 20, () => DRAWER_SIDES, (side) => side, ($$anchor, side) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => side === "bottom" ? undefined : side);

					$.component(node, () => Drawer.Root, ($$anchor, Drawer_Root) => {
						Drawer_Root($$anchor, {
							get direction() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_1 = $.first_child(fragment_2);

								{
									const child = ($$anchor, $$arg0) => {
										let props = () => ($$arg0?.()).props;

										Button($$anchor, $.spread_props({ variant: 'outline', class: 'capitalize' }, props, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, side));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										}));
									};

									$.component(node_1, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
										Drawer_Trigger($$anchor, { child, $$slots: { child: true } });
									});
								}

								var node_2 = $.sibling(node_1, 2);

								$.component(node_2, () => Drawer.Content, ($$anchor, Drawer_Content) => {
									Drawer_Content($$anchor, {
										class: 'data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_2();
											var node_3 = $.first_child(fragment_5);

											$.component(node_3, () => Drawer.Header, ($$anchor, Drawer_Header) => {
												Drawer_Header($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_6 = root();
														var node_4 = $.first_child(fragment_6);

														$.component(node_4, () => Drawer.Title, ($$anchor, Drawer_Title) => {
															Drawer_Title($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_1 = $.text('Move Goal');

																	$.append($$anchor, text_1);
																},
																$$slots: { default: true }
															});
														});

														var node_5 = $.sibling(node_4, 2);

														$.component(node_5, () => Drawer.Description, ($$anchor, Drawer_Description) => {
															Drawer_Description($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text('Set your daily activity goal.');

																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_6);
													},
													$$slots: { default: true }
												});
											});

											var div_1 = $.sibling(node_3, 2);

											$.each(div_1, 20, () => Array.from({ length: 10 }), $.index, ($$anchor, _) => {
												var p = root_1();

												$.append($$anchor, p);
											});

											$.reset(div_1);

											var node_6 = $.sibling(div_1, 2);

											$.component(node_6, () => Drawer.Footer, ($$anchor, Drawer_Footer) => {
												Drawer_Footer($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = root();
														var node_7 = $.first_child(fragment_7);

														Button(node_7, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text('Submit');

																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});

														var node_8 = $.sibling(node_7, 2);

														{
															const child = ($$anchor, $$arg0) => {
																let props = () => ($$arg0?.()).props;

																Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_4 = $.text('Cancel');

																		$.append($$anchor, text_4);
																	},
																	$$slots: { default: true }
																}));
															};

															$.component(node_8, () => Drawer.Close, ($$anchor, Drawer_Close) => {
																Drawer_Close($$anchor, { child, $$slots: { child: true } });
															});
														}

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				$.append($$anchor, fragment_1);
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}