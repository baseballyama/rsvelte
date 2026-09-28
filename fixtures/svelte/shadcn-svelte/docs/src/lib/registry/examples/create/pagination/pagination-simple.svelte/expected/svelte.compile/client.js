import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Pagination from "$lib/registry/ui/pagination/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Pagination_simple($$anchor) {
	Example($$anchor, {
		title: 'Simple',
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
								var fragment_3 = $.comment();
								var node_2 = $.first_child(fragment_3);

								$.each(node_2, 17, pages, (page) => page.key, ($$anchor, page) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									$.component(node_3, () => Pagination.Item, ($$anchor, Pagination_Item) => {
										Pagination_Item($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_4 = $.first_child(fragment_5);

												{
													var consequent = ($$anchor) => {
														var fragment_6 = $.comment();
														var node_5 = $.first_child(fragment_6);

														$.component(node_5, () => Pagination.Ellipsis, ($$anchor, Pagination_Ellipsis) => {
															Pagination_Ellipsis($$anchor, {});
														});

														$.append($$anchor, fragment_6);
													};

													var alternate = ($$anchor) => {
														var fragment_7 = $.comment();
														var node_6 = $.first_child(fragment_7);

														{
															let $0 = $.derived(() => currentPage() === $.get(page).value);

															$.component(node_6, () => Pagination.Link, ($$anchor, Pagination_Link) => {
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

														$.append($$anchor, fragment_7);
													};

													$.if(node_4, ($$render) => {
														if ($.get(page).type === "ellipsis") $$render(consequent); else $$render(alternate, -1);
													});
												}

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
				};

				$.component(node, () => Pagination.Root, ($$anchor, Pagination_Root) => {
					Pagination_Root($$anchor, {
						page: 2,
						count: 50,
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