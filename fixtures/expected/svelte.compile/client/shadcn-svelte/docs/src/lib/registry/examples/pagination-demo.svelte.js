import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Pagination from "$lib/registry/ui/pagination/index.js";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Pagination_demo($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let pages = () => ($$arg0?.()).pages;
			let currentPage = () => ($$arg0?.()).currentPage;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Pagination.Content, ($$anchor, Pagination_Content) => {
				Pagination_Content($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Pagination.Item, ($$anchor, Pagination_Item) => {
							Pagination_Item($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.component(node_3, () => Pagination.Previous, ($$anchor, Pagination_Previous) => {
										Pagination_Previous($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_2, 2);

						$.each(node_4, 17, pages, (page) => page.key, ($$anchor, page) => {
							var fragment_4 = $.comment();
							var node_5 = $.first_child(fragment_4);

							{
								var consequent = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_6 = $.first_child(fragment_5);

									$.component(node_6, () => Pagination.Item, ($$anchor, Pagination_Item_1) => {
										Pagination_Item_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												$.component(node_7, () => Pagination.Ellipsis, ($$anchor, Pagination_Ellipsis) => {
													Pagination_Ellipsis($$anchor, {});
												});

												$.append($$anchor, fragment_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_5);
								};

								var alternate = ($$anchor) => {
									var fragment_7 = $.comment();
									var node_8 = $.first_child(fragment_7);

									$.component(node_8, () => Pagination.Item, ($$anchor, Pagination_Item_2) => {
										Pagination_Item_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_8 = $.comment();
												var node_9 = $.first_child(fragment_8);

												{
													let $0 = $.derived(() => currentPage() === $.get(page).value);

													$.component(node_9, () => Pagination.Link, ($$anchor, Pagination_Link) => {
														Pagination_Link($$anchor, {
															get page() {
																return $.get(page);
															},

															get isActive() {
																return $.get($0);
															},

															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, $.get(page).value));
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});
												}

												$.append($$anchor, fragment_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								};

								$.if(node_5, ($$render) => {
									if ($.get(page).type === "ellipsis") $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_4);
						});

						var node_10 = $.sibling(node_4, 2);

						$.component(node_10, () => Pagination.Item, ($$anchor, Pagination_Item_3) => {
							Pagination_Item_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_10 = $.comment();
									var node_11 = $.first_child(fragment_10);

									$.component(node_11, () => Pagination.Ellipsis, ($$anchor, Pagination_Ellipsis_1) => {
										Pagination_Ellipsis_1($$anchor, {});
									});

									$.append($$anchor, fragment_10);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_10, 2);

						$.component(node_12, () => Pagination.Item, ($$anchor, Pagination_Item_4) => {
							Pagination_Item_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = $.comment();
									var node_13 = $.first_child(fragment_11);

									$.component(node_13, () => Pagination.Next, ($$anchor, Pagination_Next) => {
										Pagination_Next($$anchor, {});
									});

									$.append($$anchor, fragment_11);
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
		};

		$.component(node, () => Pagination.Root, ($$anchor, Pagination_Root) => {
			Pagination_Root($$anchor, { count: 30, page: 2, children, $$slots: { default: true } });
		});
	}

	$.append($$anchor, fragment);
}