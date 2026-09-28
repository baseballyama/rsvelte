import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div class="flex items-center gap-3"><span class="w-12 shrink-0 text-right text-sm text-muted-foreground"> </span> <div class="relative h-3.5 flex-1 overflow-hidden rounded-full border border-primary/40 bg-background"><div class="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out"></div></div> <span class="w-10 shrink-0 text-sm text-muted-foreground"> </span></div>`);
var root_1 = $.from_html(`<span class="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white"> </span>`);
var root_2 = $.from_html(`<button class="edp-rev-photo group relative aspect-square w-full max-w-[140px] flex-1 overflow-hidden rounded-md ring-1 ring-border"><img alt="Customer review" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/> <!></button>`);
var root_3 = $.from_html(`<div class="lg:col-span-4"><div class="flex gap-3"></div></div>`);
var root_4 = $.from_html(`<p class="mt-2 text-sm text-muted-foreground"> </p>`);
var root_5 = $.from_html(`<p class="leading-relaxed text-foreground/85"> </p>`);
var root_6 = $.from_html(`<button class="edp-rev-photo group aspect-square w-20 overflow-hidden rounded-md ring-1 ring-border transition-all hover:ring-primary sm:w-24"><img alt="" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy"/></button>`);
var root_7 = $.from_html(`<div class="mt-4 flex flex-wrap gap-2.5"></div>`);
var root_8 = $.from_html(`<div class="grid grid-cols-1 gap-4 py-7 lg:grid-cols-12 lg:gap-8"><div class="lg:col-span-4"><div class="flex items-center gap-2.5"><span class="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"><!></span> <span class="font-semibold text-foreground"> </span> <span class="text-sm text-muted-foreground"> </span></div> <div class="mt-2.5 flex items-center gap-0.5"></div> <!></div> <div class="lg:col-span-8"><!> <!></div></div>`);
var root_9 = $.from_html(`<div class="grid grid-cols-1 gap-8 border-b border-border pb-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-10"><div class="flex flex-col items-center text-center lg:col-span-3 lg:items-start lg:text-left"><div class="flex items-baseline gap-1"><span class="edp-rev-score text-5xl font-black text-foreground"> </span> <span class="text-xl font-semibold text-muted-foreground">/5</span></div> <div class="mt-2 flex items-center gap-0.5"></div> <p class="mt-2 text-sm text-muted-foreground"> </p> <!></div> <div class="lg:col-span-5"><div class="space-y-2.5"></div></div> <!></div> <div class="divide-y divide-border"></div>`, 1);
var root_10 = $.from_html(`<div class="flex flex-col items-center justify-center py-12 text-center sm:py-16"><div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border"><!></div> <h3 class="mb-2 text-2xl font-bold tracking-tight text-foreground">No reviews yet</h3> <p class="mb-8 max-w-sm text-muted-foreground">Be the first to share your thoughts on this product and help other shoppers.</p> <!></div>`);
var root_11 = $.from_html(`<!> <!>`, 1);
var root_12 = $.from_html(`<span class="absolute bottom-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white"> </span>`);
var root_13 = $.from_html(`<div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-label="Review photo viewer" tabindex="-1"><!> <!> <img class="max-h-[85vh] max-w-[92vw] rounded-md object-contain"/> <!></div>`);
var root_14 = $.from_html(`<div> </div>`);
var root_15 = $.from_html(`<div class="relative aspect-square w-20 overflow-hidden rounded-md ring-1 ring-border"><img class="h-full w-full object-cover"/> <button class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"><!></button></div>`);
var root_16 = $.from_html(`<label class="flex aspect-square w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><!> <span class="text-[10px] font-semibold">Add</span> <input type="file" accept="image/*" multiple="" class="sr-only"/></label>`);
var root_17 = $.from_html(`<div class="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/70 backdrop-blur-sm sm:p-4"><div class="relative h-full w-full overflow-hidden bg-background sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-radius sm:shadow-2xl"><div class="sticky top-0 z-10 flex items-center justify-between border-b border-border px-6 py-4 backdrop-blur-md sm:px-8 sm:py-5"><div><h3 class="text-xl font-black tracking-tight text-foreground sm:text-2xl">Write a Review</h3> <p class="text-xs font-medium text-muted-foreground sm:text-sm">Share your experience with us</p></div> <!></div> <div class="max-h-[calc(100vh-140px)] overflow-y-auto px-6 py-6 sm:max-h-[calc(90vh-170px)] sm:px-8 sm:py-8"><div class="space-y-8"><div class="space-y-3"><span class="block text-base font-bold text-foreground">Overall Rating</span> <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center"><div class="flex items-center gap-1"></div> <!></div></div> <div class="space-y-3"><label for="review" class="block text-base font-bold text-foreground">Your Story</label> <!></div> <div class="space-y-3"><span class="block text-base font-bold text-foreground">Add Photos <span class="text-sm font-normal text-muted-foreground">(optional, up to 5)</span></span> <div class="flex flex-wrap gap-3"><!> <!></div></div></div></div> <div class="border-t border-border bg-background/80 px-6 py-4 backdrop-blur-md sm:px-8 sm:py-5"><div class="flex items-center justify-end gap-3"><!> <!></div></div></div></div>`);
var root_18 = $.from_html(`<section class="edp-rev"><h2 class="edp-rev-title mb-6 border-b border-border pb-4 text-3xl font-bold tracking-tight text-foreground">Customer Ratings</h2> <!></section> <!> <!>`, 1);

export default function Product_reviews_section($$anchor, $$props) {
	$.push($$props, true);

	const productState = useProductState();
	const ratings = $.derived(() => page.data?.product?.ratings ?? []);

	const accRating = $.derived(() => {
		if (!$.get(ratings).length) return 0;

		const total = $.get(ratings).reduce((acc, cur) => acc + cur.rating, 0);

		return Math.floor(total / $.get(ratings).length * 10) / 10;
	});

	// Review photos are stored as a comma-separated URL list in `img`.
	const reviewImages = (r) => r?.img
		? String(r.img).split(',').map((s) => s.trim()).filter(Boolean)
		: [];

	const allPhotos = $.derived(() => $.get(ratings).flatMap(reviewImages));
	const PHOTO_STRIP = 3;

	const variantTitle = (variantId) => {
		const v = page.data?.product?.variants?.find((x) => x.id === variantId);

		return v?.title && v.title !== 'default' ? v.title : '';
	};

	const distribution = $.derived(() => [5, 4, 3, 2, 1].map((stars) => {
		const count = $.get(ratings).filter((r) => Math.round(r.rating) === stars).length;

		return {
			stars,
			count,
			pct: $.get(ratings).length ? Math.round(count / $.get(ratings).length * 100) : 0
		};
	}));

	// Lightbox for review photos
	let lightbox = $.state(null);

	const openLightbox = (photos, index = 0) => $.set(lightbox, { photos, index }, true);

	const lightboxStep = (delta) => {
		if (!$.get(lightbox)) return;

		$.get(lightbox).index = ($.get(lightbox).index + delta + $.get(lightbox).photos.length) % $.get(lightbox).photos.length;
	};

	// Review-form photo upload
	let pendingPhotos = $.state($.proxy([]));

	let submitting = $.state(false);

	const onPhotosPicked = (e) => {
		const files = [...e.target.files ?? []].slice(0, 5 - $.get(pendingPhotos).length);

		$.set(
			pendingPhotos,
			[
				...$.get(pendingPhotos),
				...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
			],
			true
		);

		e.target.value = '';
	};

	const removePendingPhoto = (i) => {
		URL.revokeObjectURL($.get(pendingPhotos)[i].preview);
		$.set(pendingPhotos, $.get(pendingPhotos).filter((_, idx) => idx !== i), true);
	};

	async function submitReview() {
		$.set(submitting, true);

		try {
			let uploadedImages = [];

			if ($.get(pendingPhotos).length) {
				const uploads = await uploadService.uploadMultipleToS3({
					files: $.get(pendingPhotos).map((p) => p.file),
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
			$.get(pendingPhotos).forEach((p) => URL.revokeObjectURL(p.preview));
			$.set(pendingPhotos, [], true);
			await invalidateAll();
			toast.success('Review published! Thanks for sharing.');
		} catch(error) {
			toast.error(error?.message || 'Could not post review. Try again?');
		} finally {
			$.set(submitting, false);
		}
	}

	const ratingLabels = [
		{ text: 'Very Disappointed', color: 'text-red-500' },
		{ text: 'Slightly Disappointed', color: 'text-orange-500' },
		{ text: 'Good', color: 'text-emerald-500' },
		{ text: 'Very Good', color: 'text-emerald-600' },
		{ text: 'Excellent', color: 'text-emerald-700' }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_12 = ($$anchor) => {
			var fragment_1 = root_18();
			var section = $.first_child(fragment_1);
			var node_1 = $.sibling($.child(section), 2);

			{
				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_9();
					var div = $.first_child(fragment_2);
					var div_1 = $.child(div);
					var div_2 = $.child(div_1);
					var span = $.child(div_2);
					var text = $.only_child(span, true);

					$.next(2);
					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);

					$.each(div_3, 20, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
						{
							let $0 = $.derived(() => i < Math.round($.get(accRating)) ? 'currentColor' : 'none');
							let $1 = $.derived(() => i < Math.round($.get(accRating)) ? 'text-primary' : 'text-muted-foreground/50');

							Star($$anchor, {
								get fill() {
									return $.get($0);
								},

								get class() {
									return `h-5 w-5 ${$.get($1) ?? ''}`;
								}
							});
						}
					});

					$.reset(div_3);

					var p_1 = $.sibling(div_3, 2);
					var text_1 = $.only_child(p_1);
					var node_2 = $.sibling(p_1, 2);

					Button(node_2, {
						class: 'mt-4',
						onclick: () => productState.showReviewForm = true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Write a Review');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.reset(div_1);

					var div_4 = $.sibling(div_1, 2);
					var div_5 = $.child(div_4);

					$.each(div_5, 21, () => $.get(distribution), $.index, ($$anchor, row) => {
						var div_6 = root();
						var span_1 = $.child(div_6);
						var text_3 = $.only_child(span_1);
						var div_7 = $.sibling(span_1, 2);
						var div_8 = $.only_child(div_7);
						var span_2 = $.sibling(div_7, 2);
						var text_4 = $.only_child(span_2);

						$.reset(div_6);

						$.template_effect(() => {
							$.set_text(text_3, `${$.get(row).stars ?? ''} star`);
							$.set_style(div_8, `width: ${$.get(row).pct ?? ''}%`);
							$.set_text(text_4, `${$.get(row).pct ?? ''}%`);
						});

						$.append($$anchor, div_6);
					});

					$.reset(div_5);
					$.reset(div_4);

					var node_3 = $.sibling(div_4, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_9 = root_3();
							var div_10 = $.child(div_9);

							$.each(div_10, 21, () => $.get(allPhotos).slice(0, PHOTO_STRIP), $.index, ($$anchor, photo, i) => {
								var button = root_2();
								var img = $.child(button);
								var node_4 = $.sibling(img, 2);

								{
									var consequent = ($$anchor) => {
										var span_3 = root_1();
										var text_5 = $.only_child(span_3);

										$.template_effect(() => $.set_text(text_5, `+${$.get(allPhotos).length - PHOTO_STRIP} more`));
										$.append($$anchor, span_3);
									};

									$.if(node_4, ($$render) => {
										if (i === PHOTO_STRIP - 1 && $.get(allPhotos).length > PHOTO_STRIP) $$render(consequent);
									});
								}

								$.reset(button);

								$.template_effect(() => {
									$.set_attribute(button, 'aria-label', `View customer photo ${i + 1} of ${$.get(allPhotos).length ?? ''}`);
									$.set_attribute(img, 'src', $.get(photo));
								});

								$.delegated('click', button, () => openLightbox($.get(allPhotos), i));
								$.append($$anchor, button);
							});

							$.reset(div_10);
							$.reset(div_9);
							$.append($$anchor, div_9);
						};

						$.if(node_3, ($$render) => {
							if ($.get(allPhotos).length) $$render(consequent_1);
						});
					}

					$.reset(div);

					var div_11 = $.sibling(div, 2);

					$.each(div_11, 21, () => $.get(ratings), $.index, ($$anchor, rating) => {
						const photos = $.derived(() => reviewImages($.get(rating)));
						const size = $.derived(() => variantTitle($.get(rating).variantId));
						var div_12 = root_8();
						var div_13 = $.child(div_12);
						var div_14 = $.child(div_13);
						var span_4 = $.child(div_14);
						var node_5 = $.child(span_4);

						UserRound(node_5, { class: 'h-4 w-4' });
						$.reset(span_4);

						var span_5 = $.sibling(span_4, 2);
						var text_6 = $.only_child(span_5, true);
						var span_6 = $.sibling(span_5, 2);
						var text_7 = $.only_child(span_6, true);

						$.reset(div_14);

						var div_15 = $.sibling(div_14, 2);

						$.each(div_15, 20, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
							{
								let $0 = $.derived(() => i < Math.round($.get(rating).rating)
									? 'fill-primary text-primary'
									: 'text-muted-foreground/40');

								StarIcon($$anchor, {
									get class() {
										return `h-4.5 w-4.5 ${$.get($0) ?? ''}`;
									}
								});
							}
						});

						$.reset(div_15);

						var node_6 = $.sibling(div_15, 2);

						{
							var consequent_2 = ($$anchor) => {
								var p_2 = root_4();
								var text_8 = $.only_child(p_2);

								$.template_effect(() => $.set_text(text_8, `Size: ${$.get(size) ?? ''}`));
								$.append($$anchor, p_2);
							};

							$.if(node_6, ($$render) => {
								if ($.get(size)) $$render(consequent_2);
							});
						}

						$.reset(div_13);

						var div_16 = $.sibling(div_13, 2);
						var node_7 = $.child(div_16);

						{
							var consequent_3 = ($$anchor) => {
								var p_3 = root_5();
								var text_9 = $.only_child(p_3, true);

								$.template_effect(() => $.set_text(text_9, $.get(rating).review));
								$.append($$anchor, p_3);
							};

							$.if(node_7, ($$render) => {
								if ($.get(rating).review) $$render(consequent_3);
							});
						}

						var node_8 = $.sibling(node_7, 2);

						{
							var consequent_4 = ($$anchor) => {
								var div_17 = root_7();

								$.each(div_17, 21, () => $.get(photos), $.index, ($$anchor, photo, i) => {
									var button_1 = root_6();
									var img_1 = $.only_child(button_1);

									$.template_effect(() => {
										$.set_attribute(button_1, 'aria-label', `View review photo ${i + 1} from ${($.get(rating).name || 'customer') ?? ''}`);
										$.set_attribute(img_1, 'src', $.get(photo));
									});

									$.delegated('click', button_1, () => openLightbox($.get(photos), i));
									$.append($$anchor, button_1);
								});

								$.reset(div_17);
								$.append($$anchor, div_17);
							};

							$.if(node_8, ($$render) => {
								if ($.get(photos).length) $$render(consequent_4);
							});
						}

						$.reset(div_16);
						$.reset(div_12);

						$.template_effect(
							($0) => {
								$.set_text(text_6, $.get(rating).name || 'Guest');
								$.set_text(text_7, $0);
							},
							[
								() => $.get(rating).createdAt ? date($.get(rating).createdAt) : ''
							]
						);

						$.append($$anchor, div_12);
					});

					$.reset(div_11);

					$.template_effect(() => {
						$.set_text(text, $.get(accRating) || '0.0');

						$.set_text(text_1, `Based on ${$.get(ratings).length ?? ''}
						${$.get(ratings).length === 1 ? 'review' : 'reviews'}`);
					});

					$.append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var div_18 = root_10();
					var div_19 = $.child(div_18);
					var node_9 = $.child(div_19);

					Star(node_9, { class: 'h-10 w-10' });
					$.reset(div_19);

					var node_10 = $.sibling(div_19, 6);

					Button(node_10, {
						class: 'h-12 px-8',
						onclick: () => productState.showReviewForm = true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Write the First Review');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.reset(div_18);
					$.append($$anchor, div_18);
				};

				$.if(node_1, ($$render) => {
					if ($.get(ratings).length) $$render(consequent_5); else $$render(alternate, -1);
				});
			}

			$.reset(section);

			var node_11 = $.sibling(section, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_20 = root_13();
					var node_12 = $.child(div_20);

					Button(node_12, {
						variant: 'ghost',
						size: 'icon',
						class: 'absolute right-4 top-4 rounded-full text-white hover:bg-white/10 hover:text-white',
						onclick: (e) => {
							e.stopPropagation();
							$.set(lightbox, null);
						},
						'aria-label': 'Close photo viewer',
						children: ($$anchor, $$slotProps) => {
							X($$anchor, { class: 'h-6 w-6' });
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					{
						var consequent_6 = ($$anchor) => {
							var fragment_6 = root_11();
							var node_14 = $.first_child(fragment_6);

							Button(node_14, {
								variant: 'ghost',
								size: 'icon',
								class: 'absolute left-3 rounded-full text-white hover:bg-white/10 hover:text-white',
								onclick: (e) => {
									e.stopPropagation();
									lightboxStep(-1);
								},
								'aria-label': 'Previous photo',
								children: ($$anchor, $$slotProps) => {
									ChevronLeft($$anchor, { class: 'h-7 w-7' });
								},
								$$slots: { default: true }
							});

							var node_15 = $.sibling(node_14, 2);

							Button(node_15, {
								variant: 'ghost',
								size: 'icon',
								class: 'absolute right-3 top-1/2 rounded-full text-white hover:bg-white/10 hover:text-white',
								onclick: (e) => {
									e.stopPropagation();
									lightboxStep(1);
								},
								'aria-label': 'Next photo',
								children: ($$anchor, $$slotProps) => {
									ChevronRight($$anchor, { class: 'h-7 w-7' });
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						};

						$.if(node_13, ($$render) => {
							if ($.get(lightbox).photos.length > 1) $$render(consequent_6);
						});
					}

					var img_2 = $.sibling(node_13, 2);
					var node_16 = $.sibling(img_2, 2);

					{
						var consequent_7 = ($$anchor) => {
							var span_7 = root_12();
							var text_11 = $.only_child(span_7);

							$.template_effect(() => $.set_text(text_11, `${$.get(lightbox).index + 1} / ${$.get(lightbox).photos.length ?? ''}`));
							$.append($$anchor, span_7);
						};

						$.if(node_16, ($$render) => {
							if ($.get(lightbox).photos.length > 1) $$render(consequent_7);
						});
					}

					$.reset(div_20);

					$.template_effect(() => {
						$.set_attribute(img_2, 'src', $.get(lightbox).photos[$.get(lightbox).index]);
						$.set_attribute(img_2, 'alt', `Customer review photo ${$.get(lightbox).index + 1} of ${$.get(lightbox).photos.length ?? ''}`);
					});

					$.delegated('click', div_20, () => $.set(lightbox, null));

					$.delegated('keydown', div_20, (e) => {
						if (e.key === 'Escape') $.set(lightbox, null);
						if (e.key === 'ArrowRight') lightboxStep(1);
						if (e.key === 'ArrowLeft') lightboxStep(-1);
					});

					$.delegated('click', img_2, (e) => e.stopPropagation());
					$.transition(1, div_20, () => fade, () => ({ duration: 150 }));
					$.append($$anchor, div_20);
				};

				$.if(node_11, ($$render) => {
					if ($.get(lightbox)) $$render(consequent_8);
				});
			}

			var node_17 = $.sibling(node_11, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_21 = root_17();
					var div_22 = $.child(div_21);
					var div_23 = $.child(div_22);
					var node_18 = $.sibling($.child(div_23), 2);

					Button(node_18, {
						variant: 'ghost',
						size: 'icon',
						onclick: () => productState.showReviewForm = false,
						class: 'rounded-full',
						children: ($$anchor, $$slotProps) => {
							X($$anchor, { class: 'h-6 w-6' });
						},
						$$slots: { default: true }
					});

					$.reset(div_23);

					var div_24 = $.sibling(div_23, 2);
					var div_25 = $.child(div_24);
					var div_26 = $.child(div_25);
					var div_27 = $.sibling($.child(div_26), 2);
					var div_28 = $.child(div_27);

					$.each(div_28, 20, () => ({ length: 5 }), $.index, ($$anchor, _, i) => {
						{
							let $0 = $.derived(() => productState.select !== null && productState.select === i + 1);

							Button($$anchor, {
								variant: 'plain',
								class: 'h-11 w-11 p-0',
								'aria-label': `Rate ${i + 1} ${i === 0 ? 'star' : 'stars'}`,
								get 'aria-pressed'() {
									return $.get($0);
								},
								onclick: () => productState.onSelect(i + 1),
								children: ($$anchor, $$slotProps) => {
									{
										let $0 = $.derived(() => productState.select !== null && productState.select >= i + 1 ? 'currentColor' : 'none');
										let $1 = $.derived(() => productState.select !== null && productState.select >= i + 1 ? 'text-primary' : 'text-muted-foreground');

										Star($$anchor, {
											get fill() {
												return $.get($0);
											},
											strokeWidth: 1.5,
											get class() {
												return `!h-9 !w-9 transition-colors ${$.get($1) ?? ''}`;
											}
										});
									}
								},
								$$slots: { default: true }
							});
						}
					});

					$.reset(div_28);

					var node_19 = $.sibling(div_28, 2);

					{
						var consequent_9 = ($$anchor) => {
							var div_29 = root_14();
							var text_12 = $.only_child(div_29, true);

							$.template_effect(
								($0) => {
									$.set_class(div_29, 1, `rounded-full px-4 py-1.5 text-xs font-black ring-1 ring-inset ${$0 ?? ''} ${ratingLabels[productState.select - 1].color ?? ''}`);
									$.set_text(text_12, ratingLabels[productState.select - 1].text);
								},
								[
									() => ratingLabels[productState.select - 1].color.replace('text-', 'bg-').replace('-500', '-50')
								]
							);

							$.transition(1, div_29, () => scale, () => ({ start: 0.9, duration: 200 }));
							$.append($$anchor, div_29);
						};

						$.if(node_19, ($$render) => {
							if (productState.select !== null) $$render(consequent_9);
						});
					}

					$.reset(div_27);
					$.reset(div_26);

					var div_30 = $.sibling(div_26, 2);
					var node_20 = $.sibling($.child(div_30), 2);

					Textarea(node_20, {
						id: 'review',
						placeholder: 'What did you love? What could be better? We\'re all ears.',
						class: 'min-h-[130px] rounded-md border-2 border-border p-4 text-base focus:ring-0',
						get value() {
							return productState.reviewMessage;
						},

						set value($$value) {
							productState.reviewMessage = $$value;
						}
					});

					$.reset(div_30);

					var div_31 = $.sibling(div_30, 2);
					var div_32 = $.sibling($.child(div_31), 2);
					var node_21 = $.child(div_32);

					$.each(node_21, 17, () => $.get(pendingPhotos), $.index, ($$anchor, photo, i) => {
						var div_33 = root_15();
						var img_3 = $.child(div_33);

						$.set_attribute(img_3, 'alt', `Selected review upload ${i + 1}`);

						var button_2 = $.sibling(img_3, 2);

						$.set_attribute(button_2, 'aria-label', `Remove photo ${i + 1}`);

						var node_22 = $.child(button_2);

						X(node_22, { class: 'h-3 w-3' });
						$.reset(button_2);
						$.reset(div_33);
						$.template_effect(() => $.set_attribute(img_3, 'src', $.get(photo).preview));
						$.delegated('click', button_2, () => removePendingPhoto(i));
						$.append($$anchor, div_33);
					});

					var node_23 = $.sibling(node_21, 2);

					{
						var consequent_10 = ($$anchor) => {
							var label = root_16();
							var node_24 = $.child(label);

							Camera(node_24, { class: 'h-5 w-5' });

							var input = $.sibling(node_24, 4);

							$.reset(label);
							$.delegated('change', input, onPhotosPicked);
							$.append($$anchor, label);
						};

						$.if(node_23, ($$render) => {
							if ($.get(pendingPhotos).length < 5) $$render(consequent_10);
						});
					}

					$.reset(div_32);
					$.reset(div_31);
					$.reset(div_25);
					$.reset(div_24);

					var div_34 = $.sibling(div_24, 2);
					var div_35 = $.child(div_34);
					var node_25 = $.child(div_35);

					Button(node_25, {
						variant: 'ghost',
						onclick: () => productState.showReviewForm = false,
						class: 'h-11 px-5',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Discard');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_26 = $.sibling(node_25, 2);

					{
						let $0 = $.derived(() => productState.select === null || !productState.reviewMessage || $.get(submitting));

						Button(node_26, {
							get disabled() {
								return $.get($0);
							},
							class: 'h-11 px-8',
							onclick: submitReview,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_14 = $.text();

								$.template_effect(() => $.set_text(text_14, $.get(submitting) ? 'Posting…' : 'Post Review'));
								$.append($$anchor, text_14);
							},
							$$slots: { default: true }
						});
					}

					$.reset(div_35);
					$.reset(div_34);
					$.reset(div_22);
					$.reset(div_21);
					$.transition(3, div_22, () => scale, () => ({ start: 0.95, duration: 300, easing: quintOut }));
					$.transition(3, div_21, () => fade, () => ({ duration: 200 }));
					$.append($$anchor, div_21);
				};

				$.if(node_17, ($$render) => {
					if (productState.showReviewForm) $$render(consequent_11);
				});
			}

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (page.data.store?.plugins?.isProductReviewsAndRatings?.active) $$render(consequent_12);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown', 'change']);