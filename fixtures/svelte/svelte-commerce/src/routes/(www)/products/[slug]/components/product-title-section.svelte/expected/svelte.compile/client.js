import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Star, StarHalf, HeartIcon, LoaderCircle } from '@lucide/svelte';
import { page } from '$app/state';
import { Button } from '$lib/components/ui/button/index.js';
import { useProductState } from '$lib/core/composables/index.js';

var root = $.from_html(`<p class="max-sm:hidden text-sm font-semibold leading-[1] edp-cat"> </p>`);
var root_1 = $.from_html(`<div class="mt-3 line-clamp-3 text-xs font-medium sm:text-sm edp-subtitle"></div>`);
var root_2 = $.from_html(`<div class="intra-pt flex items-center gap-4 edp-reviewrow"><div class="flex items-center gap-2"><div class="relative flex items-center"><div class="flex gap-0.5"></div> <div class="absolute left-0 top-0 flex gap-0.5 overflow-hidden"><!> <!></div></div> <span class="text-xs font-bold text-gray-900 dark:text-gray-100"> </span> <span class="h-1 w-1 rounded-full bg-gray-300"></span> <span class="text-xs text-gray-500"> </span> <!></div></div>`);
var root_3 = $.from_html(`<div class="intra-pt edp-reviewrow"><span class="text-sm text-gray-400 edp-review-empty">Be the first to review</span></div>`);
var root_4 = $.from_html(`<div class="relative edp-titlewrap"><!> <div class="flex items-center justify-between gap-4"><h1 class="text-md flex-1 font-medium tracking-tight text-gray-900 dark:text-white sm:text-xl leading-[1] edp-title"> </h1> <!></div> <!> <!></div>`);

export default function Product_title_section($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();

	// Star rating comes from the actual ratings array (the same source the reviews
	// section renders) rather than a pre-baked product.rating scalar, so the stars
	// always match the visible reviews.
	const reviewCount = $.derived(() => $$props.product?.ratings?.length ?? 0);

	const avgRating = $.derived(() => {
		if (!$$props.product?.ratings?.length) return 0;

		const total = $$props.product.ratings.reduce((acc, cur) => acc + (cur?.rating || 0), 0);

		return Math.floor(total / $$props.product.ratings.length * 10) / 10;
	});

	const reviewsEnabled = $.derived(() => !!page?.data?.store?.plugins?.isProductReviewsAndRatings?.active);
	var div = root_4();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text = $.only_child(p, true);

			$.template_effect(() => $.set_text(text, $$props.product?.categories?.[$$props.product?.categories.length - 1]?.category?.name));
			$.append($$anchor, p);
		};

		$.if(node, ($$render) => {
			if ($$props.product?.categories) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);
	var h1 = $.child(div_1);
	var text_1 = $.only_child(h1, true);
	var node_1 = $.sibling(h1, 2);

	{
		var consequent_2 = ($$anchor) => {
			Button($$anchor, {
				variant: 'plain',
				class: 'h-9 w-9 p-0 sm:hidden',
				get onclick() {
					return productState.handleWishlistClick;
				},
				'aria-label': 'Add to wishlist',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					{
						var consequent_1 = ($$anchor) => {
							LoaderCircle($$anchor, { class: 'h-6 w-6 animate-spin text-primary' });
						};

						var alternate = ($$anchor) => {
							{
								let $0 = $.derived(() => productState.wishlisted
									? 'scale-110 fill-red-500 text-red-500'
									: 'text-gray-900');

								HeartIcon($$anchor, {
									get class() {
										return `h-6 w-6 ${$.get($0) ?? ''} transition-transform duration-300`;
									}
								});
							}
						};

						$.if(node_2, ($$render) => {
							if (productState.wishlistLoading) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if (productState.wishlistPluginEnabled) $$render(consequent_2);
		});
	}

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_2 = root_1();

			$.html(div_2, () => productState.selectedVariant?.subtitle || $$props.product.subtitle, true);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_3, ($$render) => {
			if ($$props.product.subtitle) $$render(consequent_3);
		});
	}

	var node_4 = $.sibling(node_3, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_3 = root_2();
			var div_4 = $.child(div_3);
			var div_5 = $.child(div_4);
			var div_6 = $.child(div_5);

			$.each(div_6, 20, () => ({ length: 5 }), $.index, ($$anchor, _) => {
				Star($$anchor, { class: 'h-4 w-4 fill-gray-100 text-gray-100' });
			});

			$.reset(div_6);

			var div_7 = $.sibling(div_6, 2);
			var node_5 = $.child(div_7);

			$.each(node_5, 16, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
				{
					let $0 = $.derived(() => i < Math.floor($.get(avgRating)) ? 'fill-primary text-primary' : 'hidden');

					Star($$anchor, {
						get class() {
							return `h-4 w-4 ${$.get($0) ?? ''}`;
						}
					});
				}
			});

			var node_6 = $.sibling(node_5, 2);

			{
				var consequent_4 = ($$anchor) => {
					StarHalf($$anchor, { class: 'h-4 w-4 fill-primary text-primary' });
				};

				$.if(node_6, ($$render) => {
					if ($.get(avgRating) % 1 > 0) $$render(consequent_4);
				});
			}

			$.reset(div_7);
			$.reset(div_5);

			var span = $.sibling(div_5, 2);
			var text_2 = $.only_child(span, true);
			var span_1 = $.sibling(span, 4);
			var text_3 = $.only_child(span_1);
			var node_7 = $.sibling(span_1, 2);

			Button(node_7, {
				variant: 'link',
				class: 'h-auto p-0 text-xs font-medium',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('View Reviews');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_4);
			$.reset(div_3);

			$.template_effect(() => {
				$.set_text(text_2, $.get(avgRating));
				$.set_text(text_3, `${$.get(reviewCount) ?? ''} ${$.get(reviewCount) === 1 ? 'review' : 'reviews'}`);
			});

			$.append($$anchor, div_3);
		};

		var consequent_6 = ($$anchor) => {
			var div_8 = root_3();

			$.append($$anchor, div_8);
		};

		$.if(node_4, ($$render) => {
			if ($.get(reviewCount) > 0) $$render(consequent_5); else if ($.get(reviewsEnabled)) $$render(consequent_6, 1);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text_1, productState.title || $$props.product.title));
	$.append($$anchor, div);
	$.pop();
}