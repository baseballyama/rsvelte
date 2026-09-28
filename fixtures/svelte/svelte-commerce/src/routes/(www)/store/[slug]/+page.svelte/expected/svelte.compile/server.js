import * as $ from 'svelte/internal/server';
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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let productsCount = 0;
		let products = {};
		let loading = true;
		let reviews = [];
		let loadingReviews = true;
		let { data } = $$props;

		const mount = async () => {
			loading = true;

			try {
				products = await vendorService.fetchProductsOfVendor(data?.vendor?.id);
			} finally {
				loading = false;
			}
		};

		const fetchReviews = async () => {
			loadingReviews = true;

			try {
				// Replace with actual review fetching logic
				reviews = await reviewService.fetchReviews({
					productId: data?.product?.id,
					search: page.url.searchParams.get('search') || '',
					sort: page.url.searchParams.get('sort') || '-createdAt',
					currentPage: Number(page.url.searchParams.get('page')) || 1
				});
			} finally {
				loadingReviews = false;
			}
		};

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

		$.head('sjap8p', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(data?.vendor?.businessName)}</title>`);
			});
		});

		$$renderer.push(`<div class="container mx-auto">`);

		if (loading) {
			$$renderer.push(`<!--[0--><div class="mb-5">`);
			Skeleton($$renderer, { class: 'h-48 w-full rounded-lg' });
			$$renderer.push(`<!----></div> <div class="mb-8 space-y-1 text-center">`);
			Skeleton($$renderer, { class: 'mx-auto h-8 w-64' });
			$$renderer.push(`<!----></div> <div class="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800"><div class="flex items-center justify-between"><div class="space-y-3">`);
			Skeleton($$renderer, { class: 'h-6 w-32' });
			$$renderer.push(`<!----> <div class="flex gap-2">`);
			Skeleton($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----> `);
			Skeleton($$renderer, { class: 'h-5 w-5' });
			$$renderer.push(`<!----></div></div> `);
			Skeleton($$renderer, { class: 'h-12 w-32' });
			$$renderer.push(`<!----></div></div> <div class="mb-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"><!--[-->`);

			const each_array = $.ensure_array_like(Array(10));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let _ = each_array[$$index];

				$$renderer.push(`<div class="space-y-3">`);
				Skeleton($$renderer, { class: 'aspect-square w-full rounded-lg' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-[80%]' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-[60%]' });
				$$renderer.push(`<!----> <div class="flex gap-2">`);
				Skeleton($$renderer, { class: 'h-4 w-[40%]' });
				$$renderer.push(`<!----> `);
				Skeleton($$renderer, { class: 'h-4 w-[30%]' });
				$$renderer.push(`<!----></div></div>`);
			}

			$$renderer.push(`<!--]--></div> <div class="flex justify-center">`);
			Skeleton($$renderer, { class: 'h-10 w-72' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');

			if (data?.vendor?.banners) {
				$$renderer.push(`<!--[0--><div class="mb-5"><img${$.attr('src', data?.vendor?.banners)}${$.attr('alt', data?.vendor?.businessName)} class="h-48 w-full rounded-lg object-cover"/></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="mb-8 flex flex-row justify-center space-x-3"><h2 class="text-2xl font-semibold tracking-tight">Products of ${$.escape(data?.vendor?.businessName)}</h2></div>  <div class="mb-5 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">`);

			if (products?.data?.length > 0) {
				$$renderer.push(`<!--[0--><!--[-->`);

				const each_array_1 = $.ensure_array_like(products?.data);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let p = each_array_1[$$index_1];

					Product($$renderer, {
						product: {
							id: p.id,
							slug: p.slug,
							thumbnail: p.thumbnail,
							price: p.price,
							mrp: p.mrp,
							title: p.title,
							vendor: p.vendor,
							variants: p.variants
						},
						aspectRatio: 'square'
					});
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);
			Pagination($$renderer, { noOfPage: products.noOfPage });
			$$renderer.push(`<!---->`);
		}

		$$renderer.push(`<!--]--></div> `);
		Canonical($$renderer, {});
		$$renderer.push(`<!---->`);
	});
}