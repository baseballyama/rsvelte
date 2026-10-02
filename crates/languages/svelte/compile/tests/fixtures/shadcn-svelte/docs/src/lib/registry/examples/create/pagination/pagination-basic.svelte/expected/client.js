import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Pagination from "$lib/registry/ui/pagination/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Pagination_basic($$anchor) {
	Example($$anchor, {
		title: 'Basic',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let pages = () => ($$arg0?.()).pages;
					let currentPage = () => ($$arg0?.()).currentPage;
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.component(node_1, () => Pagination.Content, ($$anchor, Pagination_Content) => {
						Pagination_Content($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root();
								var node_2 = $.first_child(fragment_3);

								$.component(node_2, () => Pagination.Item, ($$anchor, Pagination_Item) => {
									Pagination_Item($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = $.comment();
											var node_3 = $.first_child(fragment_4);

											$.component(node_3, () => Pagination.PrevButton, ($$anchor, Pagination_PrevButton) => {
												Pagination_PrevButton($$anchor, {});
											});

											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								var node_4 = $.sibling(node_2, 2);

								$.each(node_4, 17, pages, (page) => page.key, ($$anchor, page) => {
									var fragment_5 = $.comment();
									var node_5 = $.first_child(fragment_5);

									{
										var consequent = ($$anchor) => {
											var fragment_6 = $.comment();
											var node_6 = $.first_child(fragment_6);

											$.component(node_6, () => Pagination.Item, ($$anchor, Pagination_Item_1) => {
												Pagination_Item_1($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_7 = $.comment();
														var node_7 = $.first_child(fragment_7);

														$.component(node_7, () => Pagination.Ellipsis, ($$anchor, Pagination_Ellipsis) => {
															Pagination_Ellipsis($$anchor, {});
														});

														$.append($$anchor, fragment_7);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_6);
										};

										var alternate = ($$anchor) => {
											var fragment_8 = $.comment();
											var node_8 = $.first_child(fragment_8);

											$.component(node_8, () => Pagination.Item, ($$anchor, Pagination_Item_2) => {
												Pagination_Item_2($$anchor, {
													children: ($$anchor, $$slotProps) => {
														var fragment_9 = $.comment();
														var node_9 = $.first_child(fragment_9);

														{
															let $0 = $.derived(() => currentPage() === $.get(page).value);

															$.component(node_9, () => Pagination.Link, ($$anchor, Pagination_Link) => {
																Pagination_Link($$anchor, {
																	get page() {
																		return $.get(page);
																	},

																	get isActive() {
																		return $.get($0);
																	}
																});
															});
														}

														$.append($$anchor, fragment_9);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_8);
										};

										$.if(node_5, ($$render) => {
											if ($.get(page).type === "ellipsis") $$render(consequent); else $$render(alternate, -1);
										});
									}

									$.append($$anchor, fragment_5);
								});

								var node_10 = $.sibling(node_4, 2);

								$.component(node_10, () => Pagination.Item, ($$anchor, Pagination_Item_3) => {
									Pagination_Item_3($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = $.comment();
											var node_11 = $.first_child(fragment_10);

											$.component(node_11, () => Pagination.NextButton, ($$anchor, Pagination_NextButton) => {
												Pagination_NextButton($$anchor, {});
											});

											$.append($$anchor, fragment_10);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.component(node, () => Pagination.Root, ($$anchor, Pagination_Root) => {
					Pagination_Root($$anchor, {
						page: 2,
						count: 30,
						perPage: 10,
						children,
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}