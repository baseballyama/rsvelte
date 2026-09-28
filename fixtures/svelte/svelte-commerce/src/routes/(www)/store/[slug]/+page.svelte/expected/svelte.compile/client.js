import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Canonical from '$lib/components/seo/canonical.svelte';
import Product from '$lib/components/product-catalogue/product-card.svelte';

import {
	chatService,
	reviewService,
	ReviewService,
	vendorService,
	VendorService
} from '$lib/core/services';

import { Skeleton } from '$lib/components/ui/skeleton';
import { page } from '$app/state';
import { toast } from '@misiki/kitcommerce-core';
import { goto } from '$app/navigation';
import Pagination from '$lib/components/common/pagination.svelte';

var root = $.from_html(`<div class="space-y-3"><!> <!> <!> <div class="flex gap-2"><!> <!></div></div>`);
var root_1 = $.from_html(`<div class="mb-5"><!></div> <div class="mb-8 space-y-1 text-center"><!></div> <div class="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800"><div class="flex items-center justify-between"><div class="space-y-3"><!> <div class="flex gap-2"><!> <!> <!> <!> <!></div></div> <!></div></div> <div class="mb-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"></div> <div class="flex justify-center"><!></div>`, 1);
var root_2 = $.from_html(`<div class="mb-5"><img class="h-48 w-full rounded-lg object-cover"/></div>`);
var root_3 = $.from_html(`<!> <div class="mb-8 flex flex-row justify-center space-x-3"><h2 class="text-2xl font-semibold tracking-tight"> </h2></div>  <div class="mb-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"><!></div> <!>`, 1);
var root_4 = $.from_html(`<div class="container mx-auto"><!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let productsCount = 0;
	let products = $.state($.proxy({}));
	let loading = $.state(true);
	let reviews = $.state($.proxy([]));
	let loadingReviews = $.state(true);

	const mount = async () => {
		$.set(loading, true);

		try {
			$.set(products, await vendorService.fetchProductsOfVendor($$props.data?.vendor?.id), true);
		} finally {
			$.set(loading, false);
		}
	};

	const fetchReviews = async () => {
		$.set(loadingReviews, true);

		try {
			// Replace with actual review fetching logic
			$.set(
				reviews,
				await reviewService.fetchReviews({
					productId: $$props.data?.product?.id,
					search: page.url.searchParams.get('search') || '',
					sort: page.url.searchParams.get('sort') || '-createdAt',
					currentPage: Number(page.url.searchParams.get('page')) || 1
				}),
				true
			);
		} finally {
			$.set(loadingReviews, false);
		}
	};

	$.user_effect(() => {
		mount();
		fetchReviews();
	});

	function getRatingColor(rating) {
		if (rating >= 4) return 'text-green-500';
		if (rating >= 3) return 'text-yellow-500';

		return 'text-red-500';
	}

	const sendMessageToChat = async (chatId, vendorId, message) => {
		const payload = { chat_id: chatId, message, vendorId };
		const res = await chatService.save(payload);
	};

	const initiateChatWithVendor = async (vendorId) => {
		try {
			const res = await chatService.chats({ vendorId });

			if (res?.chatId) {
				await sendMessageToChat(res.chatId, vendorId, 'Hi, I am interested in your products.').then(() => {
					toast.success('Chat initiated successfully');
					goto('/messages');
				}).catch((e) => {
					toast.error(e?.message);
				});
			}
		} catch(e) {
			toast.error(e?.message);
		}
	};

	var fragment = root_4();

	$.head('sjap8p', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = $$props.data?.vendor?.businessName ?? '';
		});
	});

	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root_1();
			var div_1 = $.first_child(fragment_1);
			var node_1 = $.child(div_1);

			Skeleton(node_1, { class: 'h-48 w-full rounded-lg' });
			$.reset(div_1);

			var div_2 = $.sibling(div_1, 2);
			var node_2 = $.child(div_2);

			Skeleton(node_2, { class: 'mx-auto h-8 w-64' });
			$.reset(div_2);

			var div_3 = $.sibling(div_2, 2);
			var div_4 = $.child(div_3);
			var div_5 = $.child(div_4);
			var node_3 = $.child(div_5);

			Skeleton(node_3, { class: 'h-6 w-32' });

			var div_6 = $.sibling(node_3, 2);
			var node_4 = $.child(div_6);

			Skeleton(node_4, { class: 'h-5 w-5' });

			var node_5 = $.sibling(node_4, 2);

			Skeleton(node_5, { class: 'h-5 w-5' });

			var node_6 = $.sibling(node_5, 2);

			Skeleton(node_6, { class: 'h-5 w-5' });

			var node_7 = $.sibling(node_6, 2);

			Skeleton(node_7, { class: 'h-5 w-5' });

			var node_8 = $.sibling(node_7, 2);

			Skeleton(node_8, { class: 'h-5 w-5' });
			$.reset(div_6);
			$.reset(div_5);

			var node_9 = $.sibling(div_5, 2);

			Skeleton(node_9, { class: 'h-12 w-32' });
			$.reset(div_4);
			$.reset(div_3);

			var div_7 = $.sibling(div_3, 2);

			$.each(div_7, 20, () => Array(10), $.index, ($$anchor, _) => {
				var div_8 = root();
				var node_10 = $.child(div_8);

				Skeleton(node_10, { class: 'aspect-square w-full rounded-lg' });

				var node_11 = $.sibling(node_10, 2);

				Skeleton(node_11, { class: 'h-4 w-[80%]' });

				var node_12 = $.sibling(node_11, 2);

				Skeleton(node_12, { class: 'h-4 w-[60%]' });

				var div_9 = $.sibling(node_12, 2);
				var node_13 = $.child(div_9);

				Skeleton(node_13, { class: 'h-4 w-[40%]' });

				var node_14 = $.sibling(node_13, 2);

				Skeleton(node_14, { class: 'h-4 w-[30%]' });
				$.reset(div_9);
				$.reset(div_8);
				$.append($$anchor, div_8);
			});

			$.reset(div_7);

			var div_10 = $.sibling(div_7, 2);
			var node_15 = $.child(div_10);

			Skeleton(node_15, { class: 'h-10 w-72' });
			$.reset(div_10);
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_2 = root_3();
			var node_16 = $.first_child(fragment_2);

			{
				var consequent_1 = ($$anchor) => {
					var div_11 = root_2();
					var img = $.only_child(div_11);

					$.template_effect(() => {
						$.set_attribute(img, 'src', $$props.data?.vendor?.banners);
						$.set_attribute(img, 'alt', $$props.data?.vendor?.businessName);
					});

					$.append($$anchor, div_11);
				};

				$.if(node_16, ($$render) => {
					if ($$props.data?.vendor?.banners) $$render(consequent_1);
				});
			}

			var div_12 = $.sibling(node_16, 2);
			var h2 = $.child(div_12);
			var text = $.only_child(h2);

			$.reset(div_12);

			var div_13 = $.sibling(div_12, 2);
			var node_17 = $.child(div_13);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_3 = $.comment();
					var node_18 = $.first_child(fragment_3);

					$.each(node_18, 17, () => $.get(products)?.data, $.index, ($$anchor, p) => {
						{
							let $0 = $.derived(() => ({
								id: $.get(p).id,
								slug: $.get(p).slug,
								thumbnail: $.get(p).thumbnail,
								price: $.get(p).price,
								mrp: $.get(p).mrp,
								title: $.get(p).title,
								vendor: $.get(p).vendor,
								variants: $.get(p).variants
							}));

							Product($$anchor, {
								get product() {
									return $.get($0);
								},
								aspectRatio: 'square'
							});
						}
					});

					$.append($$anchor, fragment_3);
				};

				$.if(node_17, ($$render) => {
					if ($.get(products)?.data?.length > 0) $$render(consequent_2);
				});
			}

			$.reset(div_13);

			var node_19 = $.sibling(div_13, 2);

			Pagination(node_19, {
				get noOfPage() {
					return $.get(products).noOfPage;
				}
			});

			$.template_effect(() => $.set_text(text, `Products of ${$$props.data?.vendor?.businessName ?? ''}`));
			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($.get(loading)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	var node_20 = $.sibling(div, 2);

	Canonical(node_20, {});
	$.append($$anchor, fragment);
	$.pop();
}