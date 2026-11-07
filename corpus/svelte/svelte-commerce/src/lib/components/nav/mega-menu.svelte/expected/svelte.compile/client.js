import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { MegaMenuRenderer } from '$lib/core/composables/index.js';
import { getImageCDNUrl } from '$lib/core/utils/index.js';
import { page } from '$app/state';
import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
import { fade } from 'svelte/transition';
import { onMount } from 'svelte';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"></path></svg>`);
var root_1 = $.from_html(`<img loading="lazy" class="h-6 w-6 shrink-0 rounded-full object-cover"/>`);
var root_2 = $.from_html(`<img loading="lazy" class="h-8 w-8 shrink-0 rounded object-cover"/>`);
var root_3 = $.from_html(`<li><a class="ed-mm-sub flex items-center gap-2 text-[13px] font-medium text-gray-700 transition-all hover:translate-x-1 hover:text-primary"><!> </a></li>`);
var root_4 = $.from_html(`<ul class="flex flex-col gap-1.5"></ul>`);
var root_5 = $.from_html(`<div class="flex flex-col gap-2"><a class="ed-mm-cat flex items-center gap-2 text-sm font-semibold text-gray-900 transition-all hover:translate-x-1"><!> </a> <!></div>`);
var root_6 = $.from_html(`<a class="hidden w-72 shrink-0 self-center p-6 lg:block"><!></a>`);
var root_7 = $.from_html(`<div class="ed-mm-panel mega-menu ease-out-expo absolute left-1/2 top-full w-[90vw] max-w-screen-xl -translate-x-1/2 overflow-hidden rounded-b-xl border-x border-b border-gray-100 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 svelte-1w8y9gc"><div class="flex"><div class="grid max-h-[70vh] flex-1 grid-cols-4 gap-x-8 gap-y-2 overflow-y-auto px-10 py-7 scrollbar-thin"></div> <!></div> <div class="ed-mm-foot border-t border-gray-100 bg-gray-50 px-10 py-4"><a class="ed-mm-viewall text-xs font-semibold text-muted-foreground transition-colors"> </a></div></div>`);
var root_8 = $.from_html(`<li class="hoverable svelte-1w8y9gc"><a style="font-family: var(--font-body);"><span> </span> <!></a> <!></li>`);
var root_9 = $.from_html(`<ul class="intra-gap flex max-w-[65vw] flex-row items-center justify-evenly overflow-x-auto scrollbar-none"></ul>`);
var root_10 = $.from_html(`<li><!></li>`);

export default function Mega_menu($$anchor, $$props) {
	$.push($$props, true);

	// Slim variant for the scrolled header: drops the menu list's vertical padding.
	// (jws also dropped the list's margin and border here; this list carries neither.)
	let slim = $.prop($$props, 'slim', 3, false);

	// Admin-configured header menu takes priority over the raw category megamenu.
	// Menu-builder nodes keep their children under `items`; category nodes use `children`.
	const headerMenuItems = $.derived(() => page.data.store?.menu?.find((x) => x.menuId === 'header')?.items);

	// The renderer doesn't expose loading state, so settle the same megamenu promise here
	// to tell "still loading" (skeleton) apart from "loaded but empty" (empty nav).
	let megamenuSettled = $.state(false);

	onMount(() => {
		Promise.resolve(page?.data?.store?.megamenu).catch(() => {}).finally(() => $.set(megamenuSettled, true));
	});

	function childrenOf(node) {
		return node?.items ?? node?.children;
	}

	function sortByRank(nodes) {
		return nodes?.toSorted((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
	}

	function getThumbnailURL(x, width) {
		if (page?.data?.store?.plugins?.imageCdn?.active) return getImageCDNUrl(x, width);

		return x;
	}

	{
		const content = ($$anchor, $$arg0) => {
			let toggleMenuItemChildren = () => ($$arg0?.()).toggleMenuItemChildren;
			let selectedCategory = () => ($$arg0?.()).selectedCategory;
			let openChildMenu = () => ($$arg0?.()).openChildMenu;
			let closeChildMenu = () => ($$arg0?.()).closeChildMenu;
			const items = $.derived(() => $.get(headerMenuItems) ?? []);
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent_6 = ($$anchor) => {
					var ul = root_9();

					$.each(ul, 21, () => $.get(items), $.index, ($$anchor, category, index) => {
						var li = root_8();
						var a_1 = $.child(li);
						var span = $.child(a_1);
						var text = $.only_child(span, true);
						var node_2 = $.sibling(span, 2);

						{
							var consequent = ($$anchor) => {
								var svg = root();

								$.template_effect(() => $.set_class(svg, 0, `ease-out-expo h-3.5 w-3.5 shrink-0 transition-transform duration-300
            ${selectedCategory() === $.get(category).name ? '-rotate-180 transform' : ''}`));

								$.append($$anchor, svg);
							};

							var d = $.derived(() => childrenOf($.get(category))?.length);

							$.if(node_2, ($$render) => {
								if ($.get(d)) $$render(consequent);
							});
						}

						$.reset(a_1);

						var node_3 = $.sibling(a_1, 2);

						{
							var consequent_5 = ($$anchor) => {
								var div = root_7();
								var div_1 = $.child(div);
								var div_2 = $.child(div_1);

								$.each(div_2, 21, () => sortByRank(childrenOf($.get(category))), $.index, ($$anchor, c) => {
									var div_3 = root_5();
									var a_2 = $.child(div_3);
									var node_4 = $.child(a_2);

									{
										var consequent_1 = ($$anchor) => {
											var img_1 = root_1();

											$.template_effect(
												($0) => {
													$.set_attribute(img_1, 'src', $0);
													$.set_attribute(img_1, 'alt', $.get(c)?.name);
												},
												[() => getThumbnailURL($.get(c).thumbnail, 40)]
											);

											$.event('error', img_1, (e) => {
												const img = e.currentTarget;

												if (img.src !== $.get(c).thumbnail) img.src = $.get(c).thumbnail;
											});

											$.replay_events(img_1);
											$.append($$anchor, img_1);
										};

										$.if(node_4, ($$render) => {
											if ($.get(c)?.thumbnail) $$render(consequent_1);
										});
									}

									var text_1 = $.sibling(node_4);

									$.reset(a_2);

									var node_5 = $.sibling(a_2, 2);

									{
										var consequent_3 = ($$anchor) => {
											var ul_1 = root_4();

											$.each(ul_1, 21, () => sortByRank(childrenOf($.get(c))), $.index, ($$anchor, c1) => {
												var li_1 = root_3();
												var a_3 = $.child(li_1);
												var node_6 = $.child(a_3);

												{
													var consequent_2 = ($$anchor) => {
														var img_2 = root_2();

														$.template_effect(
															($0) => {
																$.set_attribute(img_2, 'src', $0);
																$.set_attribute(img_2, 'alt', $.get(c1)?.name);
															},
															[() => getThumbnailURL($.get(c1)?.thumbnail, 40)]
														);

														$.event('error', img_2, (e) => {
															const img = e.currentTarget;

															if (img.src !== $.get(c1).thumbnail) img.src = $.get(c1).thumbnail;
														});

														$.replay_events(img_2);
														$.append($$anchor, img_2);
													};

													$.if(node_6, ($$render) => {
														if ($.get(c1)?.thumbnail) $$render(consequent_2);
													});
												}

												var text_2 = $.sibling(node_6);

												$.reset(a_3);
												$.reset(li_1);

												$.template_effect(() => {
													$.set_attribute(a_3, 'href', $.get(c1).link || '/' + $.get(c1).slug);
													$.set_text(text_2, ` ${$.get(c1).name ?? ''}`);
												});

												$.delegated('click', a_3, () => closeChildMenu()(index, false));
												$.append($$anchor, li_1);
											});

											$.reset(ul_1);
											$.append($$anchor, ul_1);
										};

										var d_1 = $.derived(() => childrenOf($.get(c)));

										$.if(node_5, ($$render) => {
											if ($.get(d_1)) $$render(consequent_3);
										});
									}

									$.reset(div_3);

									$.template_effect(() => {
										$.set_attribute(a_2, 'href', $.get(c).link || '/' + $.get(c).slug);
										$.set_text(text_1, ` ${$.get(c).name ?? ''}`);
									});

									$.delegated('click', a_2, () => closeChildMenu()(index, false));
									$.append($$anchor, div_3);
								});

								$.reset(div_2);

								var node_7 = $.sibling(div_2, 2);

								{
									var consequent_4 = ($$anchor) => {
										var a_4 = root_6();
										var node_8 = $.child(a_4);

										LazyImg(node_8, {
											get src() {
												return $.get(category).thumbnail;
											},

											get alt() {
												return $.get(category).name;
											},
											class: ''
										});

										$.reset(a_4);
										$.template_effect(() => $.set_attribute(a_4, 'href', $.get(category).link || '/' + $.get(category).slug));
										$.delegated('click', a_4, () => closeChildMenu()(index, false));
										$.append($$anchor, a_4);
									};

									$.if(node_7, ($$render) => {
										if ($.get(category)?.thumbnail) $$render(consequent_4);
									});
								}

								$.reset(div_1);

								var div_4 = $.sibling(div_1, 2);
								var a_5 = $.child(div_4);
								var text_3 = $.only_child(a_5);

								$.reset(div_4);
								$.reset(div);

								$.template_effect(() => {
									$.set_attribute(a_5, 'href', $.get(category).link || '/' + $.get(category).slug);
									$.set_text(text_3, `View all ${$.get(category).name ?? ''}`);
								});

								$.append($$anchor, div);
							};

							var d_2 = $.derived(() => toggleMenuItemChildren()[index] && childrenOf($.get(category))?.length);

							$.if(node_3, ($$render) => {
								if ($.get(d_2)) $$render(consequent_5);
							});
						}

						$.reset(li);

						$.template_effect(
							($0, $1) => {
								$.set_attribute(a_1, 'aria-haspopup', $0);
								$.set_attribute(a_1, 'aria-expanded', $1);
								$.set_attribute(a_1, 'href', $.get(category).link || '/' + $.get(category).slug);

								$.set_class(a_1, 1, `ed-mm-link relative flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap ${slim() ? 'py-1.5' : 'py-3'} text-sm font-semibold uppercase  text-gray-900 transition-all duration-300 hover:text-gray-900 active:scale-95
								${selectedCategory() === $.get(category).name ? 'text-primary after:scale-x-100' : 'after:scale-x-0'}
								after:ease-out-expo after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100`);

								$.set_text(text, $.get(category).name);
							},
							[
								() => childrenOf($.get(category))?.length ? 'true' : undefined,
								() => childrenOf($.get(category))?.length ? !!toggleMenuItemChildren()[index] : undefined
							]
						);

						$.delegated('mousemove', li, () => {
							openChildMenu()($.get(category).name, index);
						});

						$.event('mouseleave', li, () => {
							//closeChildMenu(index, true)
						});

						$.delegated('focusin', li, () => {
							openChildMenu()($.get(category).name, index);
						});

						$.delegated('focusout', li, (e) => {
							if (!e.currentTarget.contains(e.relatedTarget)) closeChildMenu()(index, true);
						});

						$.delegated('keydown', li, (e) => {
							if (e.key === 'Escape') closeChildMenu()(index, true);
						});

						$.delegated('click', a_1, () => closeChildMenu()(index, false));
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, ul);
				};

				var consequent_7 = ($$anchor) => {
					var ul_2 = root_9();

					$.each(ul_2, 20, () => Array(6), $.index, ($$anchor, _) => {
						var li_2 = root_10();
						var node_9 = $.child(li_2);

						Skeleton(node_9, { class: 'h-5 w-24 rounded-full' });
						$.reset(li_2);
						$.template_effect(() => $.set_class(li_2, 1, $.clsx(slim() ? 'py-1.5' : 'py-3')));
						$.append($$anchor, li_2);
					});

					$.reset(ul_2);
					$.transition(3, ul_2, () => fade, () => ({ duration: 100 }));
					$.append($$anchor, ul_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(items)?.length) $$render(consequent_6); else if ($.get(headerMenuItems) === undefined && !$.get(megamenuSettled)) $$render(consequent_7, 1);
				});
			}

			$.append($$anchor, fragment_1);
		};

		MegaMenuRenderer($$anchor, { content, $$slots: { content: true } });
	}

	$.pop();
}

$.delegate(['mousemove', 'focusin', 'focusout', 'keydown', 'click']);