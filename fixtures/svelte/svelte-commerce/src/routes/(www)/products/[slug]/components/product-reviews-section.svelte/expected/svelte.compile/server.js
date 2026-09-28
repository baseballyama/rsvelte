import * as $ from 'svelte/internal/server';
import { toast } from '@misiki/kitcommerce-core';

import {
	Star,
	StarIcon,
	X,
	Camera,
	ChevronLeft,
	ChevronRight,
	UserRound
} from '@lucide/svelte';

import { date } from '$lib/core/utils/index.js';
import { page } from '$app/state';
import { invalidateAll } from '$app/navigation';
import { useProductState } from '$lib/core/composables/index.js';
import { productService, uploadService } from '$lib/core/services/index.js';
import Button from '$lib/components/ui/button/button.svelte';
import { Textarea } from '$lib/components/ui/textarea/index.js';
import { fade, scale } from 'svelte/transition';
import { quintOut } from 'svelte/easing';

export default function Product_reviews_section($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const productState = useProductState();
		const ratings = $.derived(() => page.data?.product?.ratings ?? []);

		const accRating = $.derived(() => {
			if (!ratings().length) return 0;

			const total = ratings().reduce((acc, cur) => acc + cur.rating, 0);

			return Math.floor(total / ratings().length * 10) / 10;
		});

		// Review photos are stored as a comma-separated URL list in `img`.
		const reviewImages = (r) => r?.img
			? String(r.img).split(',').map((s) => s.trim()).filter(Boolean)
			: [];

		const allPhotos = $.derived(() => ratings().flatMap(reviewImages));
		const PHOTO_STRIP = 3;

		const variantTitle = (variantId) => {
			const v = page.data?.product?.variants?.find((x) => x.id === variantId);

			return v?.title && v.title !== 'default' ? v.title : '';
		};

		const distribution = $.derived(() => [5, 4, 3, 2, 1].map((stars) => {
			const count = ratings().filter((r) => Math.round(r.rating) === stars).length;

			return {
				stars,
				count,
				pct: ratings().length ? Math.round(count / ratings().length * 100) : 0
			};
		}));

		// Lightbox for review photos
		let lightbox = null;

		const openLightbox = (photos, index = 0) => lightbox = { photos, index };

		const lightboxStep = (delta) => {
			if (!lightbox) return;

			lightbox.index = (lightbox.index + delta + lightbox.photos.length) % lightbox.photos.length;
		};

		// Review-form photo upload
		let pendingPhotos = [];

		let submitting = false;

		const onPhotosPicked = (e) => {
			const files = [...e.target.files ?? []].slice(0, 5 - pendingPhotos.length);

			pendingPhotos = [
				...pendingPhotos,
				...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
			];

			e.target.value = '';
		};

		const removePendingPhoto = (i) => {
			URL.revokeObjectURL(pendingPhotos[i].preview);
			pendingPhotos = pendingPhotos.filter((_, idx) => idx !== i);
		};

		async function submitReview() {
			submitting = true;

			try {
				let uploadedImages = [];

				if (pendingPhotos.length) {
					const uploads = await uploadService.uploadMultipleToS3({
						files: pendingPhotos.map((p) => p.file),
						folderName: 'reviews',
						type: 'image'
					});

					uploadedImages = (uploads ?? []).map((u) => u?.url).filter(Boolean);
				}

				await productService.addReview({
					productId: page.data?.product.id,
					variantId: productState.selectedVariant?.id,
					rating: productState.select || 1,
					review: productState.reviewMessage,
					uploadedImages
				});

				productState.showReviewForm = false;
				pendingPhotos.forEach((p) => URL.revokeObjectURL(p.preview));
				pendingPhotos = [];
				await invalidateAll();
				toast.success('Review published! Thanks for sharing.');
			} catch(error) {
				toast.error(error?.message || 'Could not post review. Try again?');
			} finally {
				submitting = false;
			}
		}

		const ratingLabels = [
			{ text: 'Very Disappointed', color: 'text-red-500' },
			{ text: 'Slightly Disappointed', color: 'text-orange-500' },
			{ text: 'Good', color: 'text-emerald-500' },
			{ text: 'Very Good', color: 'text-emerald-600' },
			{ text: 'Excellent', color: 'text-emerald-700' }
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (page.data.store?.plugins?.isProductReviewsAndRatings?.active) {
				$$renderer.push(`<!--[0--><section class="edp-rev"><h2 class="edp-rev-title mb-6 border-b border-border pb-4 text-3xl font-bold tracking-tight text-foreground">Customer Ratings</h2> `);

				if (ratings().length) {
					$$renderer.push(`<!--[0--><div class="grid grid-cols-1 gap-8 border-b border-border pb-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-10"><div class="flex flex-col items-center text-center lg:col-span-3 lg:items-start lg:text-left"><div class="flex items-baseline gap-1"><span class="edp-rev-score text-5xl font-black text-foreground">${$.escape(accRating() || '0.0')}</span> <span class="text-xl font-semibold text-muted-foreground">/5</span></div> <div class="mt-2 flex items-center gap-0.5"><!--[-->`);

					const each_array = $.ensure_array_like({ length: 5 });

					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
						let _ = each_array[i];

						Star($$renderer, {
							fill: i < Math.round(accRating()) ? 'currentColor' : 'none',
							class: `h-5 w-5 ${i < Math.round(accRating()) ? 'text-primary' : 'text-muted-foreground/50'}`
						});
					}

					$$renderer.push(`<!--]--></div> <p class="mt-2 text-sm text-muted-foreground">Based on ${$.escape(ratings().length)}
						${$.escape(ratings().length === 1 ? 'review' : 'reviews')}</p> `);

					Button($$renderer, {
						class: 'mt-4',
						onclick: () => productState.showReviewForm = true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Write a Review`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="lg:col-span-5"><div class="space-y-2.5"><!--[-->`);

					const each_array_1 = $.ensure_array_like(distribution());

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let row = each_array_1[$$index_1];

						$$renderer.push(`<div class="flex items-center gap-3"><span class="w-12 shrink-0 text-right text-sm text-muted-foreground">${$.escape(row.stars)} star</span> <div class="relative h-3.5 flex-1 overflow-hidden rounded-full border border-primary/40 bg-background"><div class="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out"${$.attr_style(`width: ${$.stringify(row.pct)}%`)}></div></div> <span class="w-10 shrink-0 text-sm text-muted-foreground">${$.escape(row.pct)}%</span></div>`);
					}

					$$renderer.push(`<!--]--></div></div> `);

					if (allPhotos().length) {
						$$renderer.push(`<!--[0--><div class="lg:col-span-4"><div class="flex gap-3"><!--[-->`);

						const each_array_2 = $.ensure_array_like(allPhotos().slice(0, PHOTO_STRIP));

						for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
							let photo = each_array_2[i];

							$$renderer.push(`<button class="edp-rev-photo group relative aspect-square w-full max-w-[140px] flex-1 overflow-hidden rounded-md ring-1 ring-border"${$.attr('aria-label', `View customer photo ${$.stringify(i + 1)} of ${$.stringify(allPhotos().length)}`)}><img${$.attr('src', photo)} alt="Customer review" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/> `);

							if (i === PHOTO_STRIP - 1 && allPhotos().length > PHOTO_STRIP) {
								$$renderer.push(`<!--[0--><span class="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">+${$.escape(allPhotos().length - PHOTO_STRIP)} more</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></button>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="divide-y divide-border"><!--[-->`);

					const each_array_3 = $.ensure_array_like(ratings());

					for (let $$index_5 = 0, $$length = each_array_3.length; $$index_5 < $$length; $$index_5++) {
						let rating = each_array_3[$$index_5];
						const photos = reviewImages(rating);
						const size = variantTitle(rating.variantId);

						$$renderer.push(`<div class="grid grid-cols-1 gap-4 py-7 lg:grid-cols-12 lg:gap-8"><div class="lg:col-span-4"><div class="flex items-center gap-2.5"><span class="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">`);
						UserRound($$renderer, { class: 'h-4 w-4' });
						$$renderer.push(`<!----></span> <span class="font-semibold text-foreground">${$.escape(rating.name || 'Guest')}</span> <span class="text-sm text-muted-foreground">${$.escape(rating.createdAt ? date(rating.createdAt) : '')}</span></div> <div class="mt-2.5 flex items-center gap-0.5"><!--[-->`);

						const each_array_4 = $.ensure_array_like({ length: 5 });

						for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
							let _ = each_array_4[i];

							StarIcon($$renderer, {
								class: `h-4.5 w-4.5 ${i < Math.round(rating.rating)
									? 'fill-primary text-primary'
									: 'text-muted-foreground/40'}`
							});
						}

						$$renderer.push(`<!--]--></div> `);

						if (size) {
							$$renderer.push(`<!--[0--><p class="mt-2 text-sm text-muted-foreground">Size: ${$.escape(size)}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="lg:col-span-8">`);

						if (rating.review) {
							$$renderer.push(`<!--[0--><p class="leading-relaxed text-foreground/85">${$.escape(rating.review)}</p>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (photos.length) {
							$$renderer.push(`<!--[0--><div class="mt-4 flex flex-wrap gap-2.5"><!--[-->`);

							const each_array_5 = $.ensure_array_like(photos);

							for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
								let photo = each_array_5[i];

								$$renderer.push(`<button class="edp-rev-photo group aspect-square w-20 overflow-hidden rounded-md ring-1 ring-border transition-all hover:ring-primary sm:w-24"${$.attr('aria-label', `View review photo ${$.stringify(i + 1)} from ${$.stringify(rating.name || 'customer')}`)}><img${$.attr('src', photo)} alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/></button>`);
							}

							$$renderer.push(`<!--]--></div>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex flex-col items-center justify-center py-12 text-center sm:py-16"><div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">`);
					Star($$renderer, { class: 'h-10 w-10' });
					$$renderer.push(`<!----></div> <h3 class="mb-2 text-2xl font-bold tracking-tight text-foreground">No reviews yet</h3> <p class="mb-8 max-w-sm text-muted-foreground">Be the first to share your thoughts on this product and help other shoppers.</p> `);

					Button($$renderer, {
						class: 'h-12 px-8',
						onclick: () => productState.showReviewForm = true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Write the First Review`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]--></section> `);

				if (lightbox) {
					$$renderer.push(`<!--[0--><div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-label="Review photo viewer" tabindex="-1">`);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						class: 'absolute right-4 top-4 rounded-full text-white hover:bg-white/10 hover:text-white',
						onclick: (e) => {
							e.stopPropagation();
							lightbox = null;
						},
						'aria-label': 'Close photo viewer',
						children: ($$renderer) => {
							X($$renderer, { class: 'h-6 w-6' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (lightbox.photos.length > 1) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: 'ghost',
							size: 'icon',
							class: 'absolute left-3 rounded-full text-white hover:bg-white/10 hover:text-white',
							onclick: (e) => {
								e.stopPropagation();
								lightboxStep(-1);
							},
							'aria-label': 'Previous photo',
							children: ($$renderer) => {
								ChevronLeft($$renderer, { class: 'h-7 w-7' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'ghost',
							size: 'icon',
							class: 'absolute right-3 top-1/2 rounded-full text-white hover:bg-white/10 hover:text-white',
							onclick: (e) => {
								e.stopPropagation();
								lightboxStep(1);
							},
							'aria-label': 'Next photo',
							children: ($$renderer) => {
								ChevronRight($$renderer, { class: 'h-7 w-7' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <img${$.attr('src', lightbox.photos[lightbox.index])}${$.attr('alt', `Customer review photo ${$.stringify(lightbox.index + 1)} of ${$.stringify(lightbox.photos.length)}`)} class="max-h-[85vh] max-w-[92vw] rounded-md object-contain"/> `);

					if (lightbox.photos.length > 1) {
						$$renderer.push(`<!--[0--><span class="absolute bottom-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white">${$.escape(lightbox.index + 1)} / ${$.escape(lightbox.photos.length)}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (productState.showReviewForm) {
					$$renderer.push(`<!--[0--><div class="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/70 backdrop-blur-sm sm:p-4"><div class="relative h-full w-full overflow-hidden bg-background sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-radius sm:shadow-2xl"><div class="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 backdrop-blur-md sm:px-8 sm:py-5"><div><h3 class="text-xl font-black tracking-tight text-foreground sm:text-2xl">Write a Review</h3> <p class="text-xs font-medium text-muted-foreground sm:text-sm">Share your experience with us</p></div> `);

					Button($$renderer, {
						variant: 'ghost',
						size: 'icon',
						onclick: () => productState.showReviewForm = false,
						class: 'rounded-full',
						children: ($$renderer) => {
							X($$renderer, { class: 'h-6 w-6' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="max-h-[calc(100vh-140px)] overflow-y-auto px-6 py-6 sm:max-h-[calc(90vh-170px)] sm:px-8 sm:py-8"><div class="space-y-8"><div class="space-y-3"><span class="block text-base font-bold text-foreground">Overall Rating</span> <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center"><div class="flex items-center gap-1"><!--[-->`);

					const each_array_6 = $.ensure_array_like({ length: 5 });

					for (let i = 0, $$length = each_array_6.length; i < $$length; i++) {
						let _ = each_array_6[i];

						Button($$renderer, {
							variant: 'plain',
							class: 'h-11 w-11 p-0',
							'aria-label': `Rate ${$.stringify(i + 1)} ${i === 0 ? 'star' : 'stars'}`,
							'aria-pressed': productState.select !== null && productState.select === i + 1,
							onclick: () => productState.onSelect(i + 1),
							children: ($$renderer) => {
								Star($$renderer, {
									fill: productState.select !== null && productState.select >= i + 1 ? 'currentColor' : 'none',
									strokeWidth: 1.5,
									class: `!h-9 !w-9 transition-colors ${productState.select !== null && productState.select >= i + 1 ? 'text-primary' : 'text-muted-foreground'}`
								});
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--></div> `);

					if (productState.select !== null) {
						$$renderer.push(`<!--[0--><div${$.attr_class(`rounded-full px-4 py-1.5 text-xs font-black ring-1 ring-inset ${$.stringify(ratingLabels[productState.select - 1].color.replace('text-', 'bg-').replace('-500', '-50'))} ${$.stringify(ratingLabels[productState.select - 1].color)}`)}>${$.escape(ratingLabels[productState.select - 1].text)}</div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div> <div class="space-y-3"><label for="review" class="block text-base font-bold text-foreground">Your Story</label> `);

					Textarea($$renderer, {
						id: 'review',
						placeholder: 'What did you love? What could be better? We\'re all ears.',
						class: 'min-h-[130px] rounded-md border-2 border-border p-4 text-base focus:ring-0',
						get value() {
							return productState.reviewMessage;
						},

						set value($$value) {
							productState.reviewMessage = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="space-y-3"><span class="block text-base font-bold text-foreground">Add Photos <span class="text-sm font-normal text-muted-foreground">(optional, up to 5)</span></span> <div class="flex flex-wrap gap-3"><!--[-->`);

					const each_array_7 = $.ensure_array_like(pendingPhotos);

					for (let i = 0, $$length = each_array_7.length; i < $$length; i++) {
						let photo = each_array_7[i];

						$$renderer.push(`<div class="relative aspect-square w-20 overflow-hidden rounded-md ring-1 ring-border"><img${$.attr('src', photo.preview)}${$.attr('alt', `Selected review upload ${$.stringify(i + 1)}`)} class="h-full w-full object-cover"/> <button class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"${$.attr('aria-label', `Remove photo ${$.stringify(i + 1)}`)}>`);
						X($$renderer, { class: 'h-3 w-3' });
						$$renderer.push(`<!----></button></div>`);
					}

					$$renderer.push(`<!--]--> `);

					if (pendingPhotos.length < 5) {
						$$renderer.push(`<!--[0--><label class="flex aspect-square w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">`);
						Camera($$renderer, { class: 'h-5 w-5' });
						$$renderer.push(`<!----> <span class="text-[10px] font-semibold">Add</span> <input type="file" accept="image/*" multiple="" class="sr-only"/></label>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div></div></div></div> <div class="border-t border-border bg-background/80 px-6 py-4 backdrop-blur-md sm:px-8 sm:py-5"><div class="flex items-center justify-end gap-3">`);

					Button($$renderer, {
						variant: 'ghost',
						onclick: () => productState.showReviewForm = false,
						class: 'h-11 px-5',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Discard`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						disabled: productState.select === null || !productState.reviewMessage || submitting,
						class: 'h-11 px-8',
						onclick: submitReview,
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(submitting ? 'Posting…' : 'Post Review')}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}