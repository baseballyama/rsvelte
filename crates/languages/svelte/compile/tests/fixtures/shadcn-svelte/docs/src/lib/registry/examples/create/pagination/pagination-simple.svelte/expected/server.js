import * as $ from 'svelte/internal/server';
import * as Pagination from "$lib/registry/ui/pagination/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Pagination_simple($$renderer) {
	Example($$renderer, {
		title: 'Simple',
		children: ($$renderer) => {
			{
				function children($$renderer, { pages, currentPage }) {
					if (Pagination.Content) {
						$$renderer.push('<!--[-->');

						Pagination.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(pages);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let page = each_array[$$index];

									if (Pagination.Item) {
										$$renderer.push('<!--[-->');

										Pagination.Item($$renderer, {
											children: ($$renderer) => {
												if (page.type === "ellipsis") {
													$$renderer.push('<!--[0-->');

													if (Pagination.Ellipsis) {
														$$renderer.push('<!--[-->');
														Pagination.Ellipsis($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');

													if (Pagination.Link) {
														$$renderer.push('<!--[-->');
														Pagination.Link($$renderer, { page, isActive: currentPage === page.value });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				if (Pagination.Root) {
					$$renderer.push('<!--[-->');

					Pagination.Root($$renderer, {
						page: 2,
						count: 50,
						perPage: 10,
						children,
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		},
		$$slots: { default: true }
	});
}