import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Pagination from '$lib/components/ui/pagination';
import { Pagination as PaginationPrimitive } from 'bits-ui';
import { buttonVariants } from '$lib/components/ui/button/index.js';
import { PaginationRenderer } from '$lib/core/composables/index.js';
import { cn } from '$lib/core/utils';
import { page as appPage } from '$app/state';

var root = $.from_html(`<a> </a>`);
var root_1 = $.from_html(`<!> <div class="hidden items-center gap-1 md:flex"></div> <div class="flex items-center px-6 text-[10px] font-bold uppercase tracking-widest text-gray-900 md:hidden"><span class="mr-2 text-gray-400">Page</span> <span class="mx-2 text-gray-300">/</span> </div> <!>`, 1);
var root_2 = $.from_html(`<div class="mt-5 flex flex-col items-center gap-6 border-gray-200 pt-5"><!> <div class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"> </div></div>`);

export default function Pagination_1($$anchor, $$props) {
	$.push($$props, true);

	let noOfPage = $.prop($$props, 'noOfPage', 15);

	// ponytail: interim guard, not the fix. The listing API returns zero results past page 50,
	// so offering page 51+ lands shoppers on a false "No products match your search". Capping
	// here (the one component every listing paginates through) stops that, but the rest of a
	// large catalogue stays unreachable until the API ceiling is raised or paging goes cursor-based.
	const LAST_REACHABLE_PAGE = 50;

	const cappedNoOfPage = $.derived(() => Math.min(noOfPage() ?? 0, LAST_REACHABLE_PAGE));

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

	{
		const content = ($$anchor, $$arg0) => {
			let pageSize = () => ($$arg0?.()).pageSize;
			let currentPage = () => ($$arg0?.()).currentPage;
			let goToPreviousPage = () => ($$arg0?.()).goToPreviousPage;
			let goToNextPage = () => ($$arg0?.()).goToNextPage;
			let goToPage = () => ($$arg0?.()).goToPage;
			let count = () => ($$arg0?.()).count;
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var div = root_2();
					var node_1 = $.child(div);

					{
						const children = ($$anchor, $$arg0) => {
							let pages = () => ($$arg0?.()).pages;
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Pagination.Content, ($$anchor, Pagination_Content) => {
								Pagination_Content($$anchor, {
									class: 'gap-1',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_3 = $.first_child(fragment_3);

										$.component(node_3, () => Pagination.Item, ($$anchor, Pagination_Item) => {
											Pagination_Item($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = $.comment();
													var node_4 = $.first_child(fragment_4);

													{
														let $0 = $.derived(() => currentPage() <= 1);

														$.component(node_4, () => Pagination.PrevButton, ($$anchor, Pagination_PrevButton) => {
															Pagination_PrevButton($$anchor, {
																get onclick() {
																	return goToPreviousPage();
																},

																get disabled() {
																	return $.get($0);
																},
																class: 'h-10 px-4'
															});
														});
													}

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var div_1 = $.sibling(node_3, 2);

										$.each(div_1, 21, pages, (page) => page.key, ($$anchor, page) => {
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
																	const child = ($$anchor, $$arg0) => {
																		let props = () => ($$arg0?.()).props;
																		const anchorProps = $.derived(() => ({ ...props(), type: undefined }));
																		var a = root();

																		var event_handler = (e) => {
																			// The href is what makes this crawlable; navigation itself stays
																			// client-side, so preventDefault stops SvelteKit's own anchor
																			// handler from navigating a second time.
																			e.preventDefault();

																			goToPage()($.get(page).value);
																		};

																		var event_handler_1 = (e) => {
																			// bits-ui preventDefaults Enter (to run its own page setter), which
																			// would otherwise swallow the anchor's native activation. Everything
																			// else — arrow keys, Home/End — stays with its roving-focus handler.
																			if (e.key === 'Enter') {
																				e.preventDefault();
																				goToPage()($.get(page).value);
																			} else {
																				forwardKeydown(props(), e);
																			}
																		};

																		$.attribute_effect(
																			a,
																			($0) => ({
																				...$.get(anchorProps),
																				href: $0,
																				onclick: event_handler,
																				onkeydown: event_handler_1
																			}),
																			[() => pageHref($.get(page).value)]
																		);

																		var text = $.only_child(a, true);

																		$.template_effect(() => $.set_text(text, $.get(page).value));
																		$.append($$anchor, a);
																	};

																	let $0 = $.derived(() => $.get(page).value === $.get(activePage) ? 'page' : undefined);

																	let $1 = $.derived(() => cn(
																		buttonVariants({
																			variant: $.get(page).value === $.get(activePage) ? 'default' : 'ghost',
																			size: 'icon'
																		}),
																		'h-10 w-10'
																	));

																	$.component(node_9, () => PaginationPrimitive.Page, ($$anchor, PaginationPrimitive_Page) => {
																		PaginationPrimitive_Page($$anchor, {
																			get page() {
																				return $.get(page);
																			},

																			get 'aria-current'() {
																				return $.get($0);
																			},

																			get class() {
																				return $.get($1);
																			},
																			child,
																			$$slots: { child: true }
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
													if ($.get(page).type === 'ellipsis') $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_5);
										});

										$.reset(div_1);

										var div_2 = $.sibling(div_1, 2);
										var text_1 = $.sibling($.child(div_2));
										var text_2 = $.sibling(text_1, 2);

										$.reset(div_2);

										var node_10 = $.sibling(div_2, 2);

										$.component(node_10, () => Pagination.Item, ($$anchor, Pagination_Item_3) => {
											Pagination_Item_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_10 = $.comment();
													var node_11 = $.first_child(fragment_10);

													{
														let $0 = $.derived(() => currentPage() >= $.get(cappedNoOfPage));

														$.component(node_11, () => Pagination.NextButton, ($$anchor, Pagination_NextButton) => {
															Pagination_NextButton($$anchor, {
																get onclick() {
																	return goToNextPage();
																},

																get disabled() {
																	return $.get($0);
																},
																class: 'h-10 px-4'
															});
														});
													}

													$.append($$anchor, fragment_10);
												},
												$$slots: { default: true }
											});
										});

										$.template_effect(() => {
											$.set_text(text_1, ` ${currentPage() ?? ''} `);
											$.set_text(text_2, ` ${noOfPage() ?? ''}`);
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						};

						let $0 = $.derived(() => Math.min(count(), LAST_REACHABLE_PAGE * (pageSize() || 1)));

						$.component(node_1, () => Pagination.Root, ($$anchor, Pagination_Root) => {
							Pagination_Root($$anchor, {
								get count() {
									return $.get($0);
								},

								get perPage() {
									return pageSize();
								},

								get page() {
									return $.get(activePage);
								},
								children,
								$$slots: { default: true }
							});
						});
					}

					var div_3 = $.sibling(node_1, 2);
					var text_3 = $.only_child(div_3);

					$.reset(div);
					$.template_effect(() => $.set_text(text_3, `Showing page ${currentPage() ?? ''} of ${noOfPage() ?? ''}`));
					$.append($$anchor, div);
				};

				$.if(node, ($$render) => {
					if (count() && $.get(cappedNoOfPage) > 1) $$render(consequent_1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		PaginationRenderer($$anchor, {
			get paginateProducts() {
				return $$props.paginateProducts;
			},

			get noOfPage() {
				return noOfPage();
			},

			set noOfPage($$value) {
				noOfPage($$value);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}