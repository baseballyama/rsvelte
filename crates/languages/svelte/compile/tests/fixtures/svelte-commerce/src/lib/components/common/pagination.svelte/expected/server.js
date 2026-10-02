import * as $ from 'svelte/internal/server';
import * as Pagination from '$lib/components/ui/pagination';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import { PaginationRenderer } from '$lib/core/composables/index.js';
import { cn } from '$lib/core/utils';
import { page as appPage } from '$app/state';

export default function Pagination_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { noOfPage = void 0, paginateProducts } = $$props;

		// ponytail: interim guard, not the fix. The listing API returns zero results past page 50,
		// so offering page 51+ lands shoppers on a false "No products match your search". Capping
		// here (the one component every listing paginates through) stops that, but the rest of a
		// large catalogue stays unreachable until the API ceiling is raised or paging goes cursor-based.
		const LAST_REACHABLE_PAGE = 50;

		const cappedNoOfPage = $.derived(() => Math.min(noOfPage ?? 0, LAST_REACHABLE_PAGE));

		// Derived from the URL rather than from PaginationRenderer's `currentPage`, which is $state(1)
		// and only catches up in an effect — i.e. never on the server. Feeding it to Pagination.Root
		// makes the rendered page window (and the prev/next disabled state) correct in the SSR HTML
		// instead of always being the window around page 1.
		const activePage = $.derived(() => Number(appPage.url.searchParams.get('page')) || 1);

		// Real hrefs. bits-ui renders Pagination.Page as a <button>, so before this the only way to
		// reach page 2 of any listing was JavaScript — no crawler could follow it, and with the
		// catalogue's sitemap being the only other discovery path, deep pages were effectively orphaned.
		const pageHref = (value) => {
			const url = new URL(appPage.url);

			url.searchParams.set('page', String(value));

			return url.pathname + url.search;
		};

		// Hands a key event back to bits-ui's own roving-focus handler.
		const forwardKeydown = (props, e) => props?.onkeydown?.(e);

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function content(
					$$renderer,
					{
						pageSize,
						currentPage,
						goToPreviousPage,
						goToNextPage,
						goToPage,
						count
					}
				) {
					if (count && cappedNoOfPage() > 1) {
						$$renderer.push(`<!--[0--><div class="mt-5 flex flex-col items-center gap-6 border-gray-200 pt-5">`);

						{
							function children($$renderer, { pages }) {
								if (Pagination.Content) {
									$$renderer.push('<!--[-->');

									Pagination.Content($$renderer, {
										class: 'gap-1',
										children: ($$renderer) => {
											if (Pagination.Item) {
												$$renderer.push('<!--[-->');

												Pagination.Item($$renderer, {
													children: ($$renderer) => {
														if (Pagination.PrevButton) {
															$$renderer.push('<!--[-->');

															Pagination.PrevButton($$renderer, {
																onclick: goToPreviousPage,
																disabled: currentPage <= 1,
																class: 'h-10 px-4'
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <div class="hidden items-center gap-1 md:flex"><!--[-->`);

											const each_array = $.ensure_array_like(pages);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let page = each_array[$$index];

												if (page.type === 'ellipsis') {
													$$renderer.push('<!--[0-->');

													if (Pagination.Item) {
														$$renderer.push('<!--[-->');

														Pagination.Item($$renderer, {
															children: ($$renderer) => {
																if (Pagination.Ellipsis) {
																	$$renderer.push('<!--[-->');
																	Pagination.Ellipsis($$renderer, {});
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												} else {
													$$renderer.push('<!--[-1-->');

													if (Pagination.Item) {
														$$renderer.push('<!--[-->');

														Pagination.Item($$renderer, {
															children: ($$renderer) => {
																{
																	function child($$renderer, { props }) {
																		const anchorProps = { ...props, type: undefined };

																		$$renderer.push(`<a${$.attributes({ ...anchorProps, href: pageHref(page.value) })}>${$.escape(page.value)}</a>`);
																	}

																	if (PaginationPrimitive.Page) {
																		$$renderer.push('<!--[-->');

																		PaginationPrimitive.Page($$renderer, {
																			page,
																			'aria-current': page.value === activePage() ? 'page' : undefined,
																			class: cn(
																				buttonVariants({
																					variant: page.value === activePage() ? 'default' : 'ghost',
																					size: 'icon'
																				}),
																				'h-10 w-10'
																			),
																			child,
																			$$slots: { child: true }
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

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(`<!--]-->`);
											}

											$$renderer.push(`<!--]--></div> <div class="flex items-center px-6 text-[10px] font-bold uppercase tracking-widest text-gray-900 md:hidden"><span class="mr-2 text-gray-400">Page</span> ${$.escape(currentPage)} <span class="mx-2 text-gray-300">/</span> ${$.escape(noOfPage)}</div> `);

											if (Pagination.Item) {
												$$renderer.push('<!--[-->');

												Pagination.Item($$renderer, {
													children: ($$renderer) => {
														if (Pagination.NextButton) {
															$$renderer.push('<!--[-->');

															Pagination.NextButton($$renderer, {
																onclick: goToNextPage,
																disabled: currentPage >= cappedNoOfPage(),
																class: 'h-10 px-4'
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
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
									count: Math.min(count, LAST_REACHABLE_PAGE * (pageSize || 1)),
									perPage: pageSize,
									page: activePage(),
									children,
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Showing page ${$.escape(currentPage)} of ${$.escape(noOfPage)}</div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				PaginationRenderer($$renderer, {
					paginateProducts,
					get noOfPage() {
						return noOfPage;
					},

					set noOfPage($$value) {
						noOfPage = $$value;
						$$settled = false;
					},
					content,
					$$slots: { content: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { noOfPage });
	});
}