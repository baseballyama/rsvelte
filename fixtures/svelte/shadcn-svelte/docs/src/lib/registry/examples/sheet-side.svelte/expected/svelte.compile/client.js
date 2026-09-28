import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Sheet from "$lib/registry/ui/sheet/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

var root = $.from_html(`<!> <!>`, 1);

var root_1 = $.from_html(`<p class="mb-4 leading-normal">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
							incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
							dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
							Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
							mollit anim id est laborum.</p>`);

var root_2 = $.from_html(`<!> <div class="overflow-y-auto px-4 text-sm"><h4 class="mb-4 text-lg leading-none font-medium">Lorem Ipsum</h4> <!></div> <!>`, 1);
var root_3 = $.from_html(`<div class="grid grid-cols-2 gap-2"></div>`);

export default function Sheet_side($$anchor, $$props) {
	$.push($$props, true);

	const SHEET_SIDES = ["top", "right", "bottom", "left"];
	var div = root_3();

	$.each(div, 22, () => SHEET_SIDES, (side) => side, ($$anchor, side) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.component(node, () => Sheet.Root, ($$anchor, Sheet_Root) => {
			Sheet_Root($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_1 = $.first_child(fragment_1);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;

							Button($$anchor, $.spread_props({ variant: 'outline' }, props, {
								class: 'capitalize',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, side));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							}));
						};

						$.component(node_1, () => Sheet.Trigger, ($$anchor, Sheet_Trigger) => {
							Sheet_Trigger($$anchor, { child, $$slots: { child: true } });
						});
					}

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Sheet.Content, ($$anchor, Sheet_Content) => {
						Sheet_Content($$anchor, {
							get side() {
								return side;
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_2();
								var node_3 = $.first_child(fragment_4);

								$.component(node_3, () => Sheet.Header, ($$anchor, Sheet_Header) => {
									Sheet_Header($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root();
											var node_4 = $.first_child(fragment_5);

											$.component(node_4, () => Sheet.Title, ($$anchor, Sheet_Title) => {
												Sheet_Title($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text('Edit profile');

														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});
											});

											var node_5 = $.sibling(node_4, 2);

											$.component(node_5, () => Sheet.Description, ($$anchor, Sheet_Description) => {
												Sheet_Description($$anchor, {
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Make changes to your profile here. Click save when you\'re done.');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								var div_1 = $.sibling(node_3, 2);
								var node_6 = $.sibling($.child(div_1), 2);

								$.each(node_6, 16, () => ({ length: 10 }), $.index, ($$anchor, _, index, $$array) => {
									var p = root_1();

									$.append($$anchor, p);
								});

								$.reset(div_1);

								var node_7 = $.sibling(div_1, 2);

								$.component(node_7, () => Sheet.Footer, ($$anchor, Sheet_Footer) => {
									Sheet_Footer($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = $.comment();
											var node_8 = $.first_child(fragment_6);

											{
												let $0 = $.derived(() => buttonVariants({ variant: "outline" }));

												$.component(node_8, () => Sheet.Close, ($$anchor, Sheet_Close) => {
													Sheet_Close($$anchor, {
														get class() {
															return $.get($0);
														},

														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Save changes');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});
												});
											}

											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
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
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}