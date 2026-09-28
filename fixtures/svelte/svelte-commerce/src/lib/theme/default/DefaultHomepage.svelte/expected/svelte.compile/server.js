import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { page } from '$app/state';

import {
	Truck,
	RotateCcw,
	ShieldCheck,
	Headset,
	ArrowRight,
	ArrowUpRight,
	ChevronLeft,
	ChevronRight,
	Pause,
	Play
} from '@lucide/svelte';

import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import ProductCard from '$lib/components/product-catalogue/product-card.svelte';
import { storeService, productService } from '$lib/core/services';
import { getUserState } from '$lib/core/stores/index.js';
import { klaviyoIdentify, klaviyoSubscribe, resolveKlaviyoConfig } from '$lib/klaviyo';
import { toast } from '@misiki/kitcommerce-core';
import { z } from 'zod';
import { resolveEditorialForDevice } from '$lib/theme/homepage-content.js';
import { resolveHeroSlides, resolvePageBands } from './page-inheritance.js';

export default function DefaultHomepage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			themeContent,
			brandName,
			storeName,
			aspectWidth,
			aspectHeight,
			featuredProducts,
			featuredCategories,
			loading = false,
			desktopBanners = [],
			tabletBanners = [],
			mobileBanners = [],
			pageSections = []

			/** Merchant content from the admin `home` page — see ./page-inheritance.ts. */
		} = $$props;

		// Per-device content (admin cascade mobile → tablet → desktop). SSR renders the mobile
		// base layer (Googlebot is mobile-first); the viewport picks the real layer on mount.
		// Stores without device overrides resolve identically on every device — no flash.
		let contentDevice = 'mobile';

		const ed = $.derived(() => resolveEditorialForDevice(themeContent, contentDevice));

		// Admin-controlled per-section visibility (true = hidden), set on the store's Theme page.
		const hidden = $.derived(() => ed()?.hiddenSections ?? {});

		const productAspect = $.derived(() => `${aspectWidth || '4'} / ${aspectHeight || '5'}`);

		// Live categories take over the fallback tiles; capped at 4 for the balanced grid.
		const categoryTiles = $.derived(() => featuredCategories?.length
			? featuredCategories.slice(0, 4).map((c) => ({
				label: c?.name || c?.title || 'Shop',
				href: c?.slug ? `/${c.slug}` : c?.link || '/products',
				image: c?.image || c?.thumbnail || c?.img || ''
			}))
			: [] || []);

		// Products section source (admin Theme page): 'featured' uses the featured feed passed in
		// as props; 'latest' / 'popular' / 'category' fetch client-side. SSR renders the featured
		// feed and the configured source takes over on mount.
		let sourcedProducts = null;

		let sourceToken = 0;
		const products = $.derived(() => ((sourcedProducts ?? featuredProducts) || []).slice(0, 8));

		const assuranceIcons = {
			truck: Truck,
			returns: RotateCcw,
			shield: ShieldCheck,
			support: Headset
		};

		// --- Home-page inheritance (admin Pages → this theme). Empty unless the merchant has
		// curated banners/sections, so a store that hasn't touched Pages renders exactly as before.
		const homePage = $.derived(() => ({
			desktopBanners,
			tabletBanners,
			mobileBanners,
			sections: pageSections
		}));

		// Device-independent: each slide carries both artworks and <picture> picks per viewport,
		// so this never re-resolves (and never double-downloads) when contentDevice changes.
		const heroSlides = $.derived(() => hidden().heroSlider ? [] : resolveHeroSlides(homePage()));

		const pageBands = $.derived(() => hidden().pageSections ? [] : resolvePageBands(homePage(), contentDevice));

		// Hero slider: native scroll-snap so touch swiping is free; the arrows, dots and autoplay
		// drive it with scrollTo and read the position back on scroll.
		let heroTrack = null;

		let heroIndex = 0;
		let heroPaused = false;

		/** Read the live position rather than trusting heroIndex, which lags during the slide. */
		const currentSlide = () => heroTrack
			? Math.round(heroTrack.scrollLeft / Math.max(1, heroTrack.clientWidth))
			: 0;

		// The slide is tweened frame by frame rather than with scrollTo({behavior:'smooth'}),
		// because Chrome silently downgrades that to an instant jump when the OS has
		// "reduce motion" enabled — which killed the animation outright on such machines. Writing
		// scrollLeft ourselves is not subject to that veto, and keeps the track a real scroller so
		// touch swiping still works natively.
		const SLIDE_MS = 600;

		const easeOutCubic = (p) => 1 - (1 - p) ** 3;
		let slideFrame = 0;

		const cancelSlide = () => {
			if (slideFrame) cancelAnimationFrame(slideFrame);

			slideFrame = 0;

			if (heroTrack) heroTrack.style.scrollSnapType = '';
		};

		const slideTo = (index) => {
			const track = heroTrack;

			if (!track) return;

			cancelSlide();

			const from = track.scrollLeft;
			const to = track.clientWidth * index;

			if (Math.abs(to - from) < 1) return;

			// A background tab produces no animation frames, so a tween there would stall midway and
			// leave snapping disabled. Jump instead — nobody is watching.
			if (document.hidden) {
				track.scrollLeft = to;

				return;
			}

			// Mandatory snapping fights a frame-by-frame scrollLeft tween, so it is suspended for
			// the duration and restored at the end.
			track.style.scrollSnapType = 'none';

			const startedAt = performance.now();

			const tick = (now) => {
				const p = Math.min(1, (now - startedAt) / SLIDE_MS);

				track.scrollLeft = from + (to - from) * easeOutCubic(p);

				if (p < 1) {
					slideFrame = requestAnimationFrame(tick);
				} else {
					slideFrame = 0;
					track.style.scrollSnapType = '';
				}
			};

			slideFrame = requestAnimationFrame(tick);
		};

		/** Step by ±1 with wraparound — shared by the arrows and autoplay. */
		const stepSlide = (delta) => slideTo((currentSlide() + delta + heroSlides().length) % heroSlides().length);

		const onHeroScroll = () => {
			if (!heroTrack) return;

			heroIndex = currentSlide();
		};

		// Content that moves automatically for more than five seconds needs a real pause control
		// (WCAG 2.2.2) — hover/focus is not one on touch, where most of the traffic is — and must
		// not start at all for a visitor who asked for reduced motion. `autoplay` drives both: it
		// starts off when the media query matches, and the toggle beside the dots flips it.
		let autoplay = true;

		onMount(() => {
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) autoplay = false;
		});

		// Autoplay. Hovering or focusing the slider flips heroPaused, which tears this effect down
		// and clears the timer, so the next slide never fires while the pointer is over it.
		// A hidden tab is skipped rather than silently queueing advances nobody can see.
		// A tab hidden mid-slide would freeze the tween (no frames) and leave snapping off, so
		// finish immediately on the way out. Also stops any in-flight tween on unmount.
		let inView = false;

		onMount(() => {
			inView = true;

			// Content-layer breakpoints (independent of the CSS layout breakpoints): they match
			// the admin preview's simulated devices — mobile <768, tablet 768–1199, desktop ≥1200.
			const mqTablet = window.matchMedia('(min-width: 768px)');

			const mqDesktop = window.matchMedia('(min-width: 1200px)');

			const pick = () => {
				contentDevice = mqDesktop.matches ? 'desktop' : mqTablet.matches ? 'tablet' : 'mobile';
			};

			pick();
			mqTablet.addEventListener('change', pick);
			mqDesktop.addEventListener('change', pick);

			return () => {
				mqTablet.removeEventListener('change', pick);
				mqDesktop.removeEventListener('change', pick);
			};
		});

		// Newsletter: subscribe to Litekart's list AND the store's Klaviyo list (same flow as the
		// footer). Both are no-ops when unconfigured; on success we confirm inline.
		const userState = getUserState();

		const klaviyoConfig = $.derived(() => resolveKlaviyoConfig(page.data?.store?.plugins));
		let email = '';
		let subscribed = false;
		let subscribing = false;

		async function onSubscribe(e) {
			e.preventDefault();

			const parsed = z.string().email().safeParse(email.trim());

			if (!parsed.success) {
				toast.error('Please enter a valid email address');

				return;
			}

			subscribing = true;

			try {
				await storeService.post('/api/newsletter/subscribe', {
					email: email.trim(),
					customerId: userState?.user?.userId || null
				});

				klaviyoIdentify({ email: email.trim() });
				klaviyoSubscribe(email.trim(), klaviyoConfig());
				subscribed = true;
			} catch(err) {
				toast.error(err?.message || 'Subscription failed, please try again');
			} finally {
				subscribing = false;
			}
		}

		$.head('156wvlk', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;1,6..96,400&amp;family=Hanken+Grotesk:wght@400;500;600;700&amp;display=swap"/>`);
		});

		if (ed()) {
			$$renderer.push(`<!--[0--><div${$.attr_class('ed svelte-156wvlk', void 0, { 'is-in': inView })}>`);

			if (heroSlides().length) {
				$$renderer.push(`<!--[0--><div class="ed-slider svelte-156wvlk" role="group" aria-roledescription="carousel" aria-label="Featured banners"><div class="ed-slider__track svelte-156wvlk"><!--[-->`);

				const each_array = $.ensure_array_like(heroSlides());

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let slide = each_array[i];

					$.element(
						$$renderer,
						slide.link ? 'a' : 'div',
						() => {
							$$renderer.push(` class="ed-slide svelte-156wvlk"${$.attr('href', slide.link || undefined)}${$.attr('aria-label', slide.title || undefined)}`);
						},
						() => {
							$$renderer.push(`<picture class="svelte-156wvlk">`);

							if (slide.mobileUrl !== slide.url) {
								$$renderer.push(`<!--[0--><source media="(max-width: 767px)"${$.attr('srcset', slide.mobileUrl)}/>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (slide.tabletUrl !== slide.url) {
								$$renderer.push(`<!--[0--><source media="(max-width: 1199px)"${$.attr('srcset', slide.tabletUrl)}/>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <img${$.attr('src', slide.url)}${$.attr('alt', slide.title || 'Featured banner')}${$.attr('loading', i === 0 ? 'eager' : 'lazy')}${$.attr('fetchpriority', i === 0 ? 'high' : 'auto')} class="svelte-156wvlk"/></picture>`);
						}
					);
				}

				$$renderer.push(`<!--]--></div> `);

				if (heroSlides().length > 1) {
					$$renderer.push(`<!--[0--><button type="button" class="ed-slider__arrow ed-slider__arrow--prev svelte-156wvlk" aria-label="Previous slide">`);
					ChevronLeft($$renderer, { class: 'ed-slider__arrow-icon' });
					$$renderer.push(`<!----></button> <button type="button" class="ed-slider__arrow ed-slider__arrow--next svelte-156wvlk" aria-label="Next slide">`);
					ChevronRight($$renderer, { class: 'ed-slider__arrow-icon' });
					$$renderer.push(`<!----></button> <div class="ed-slider__dots svelte-156wvlk"><!--[-->`);

					const each_array_1 = $.ensure_array_like(heroSlides());

					for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
						let _ = each_array_1[i];

						$$renderer.push(`<button type="button" class="ed-dot svelte-156wvlk"${$.attr('aria-current', heroIndex === i)}${$.attr('aria-label', `Go to slide ${$.stringify(i + 1)}`)}></button>`);
					}

					$$renderer.push(`<!--]--> <button type="button" class="ed-slider__playpause svelte-156wvlk"${$.attr('aria-pressed', !autoplay)}${$.attr('aria-label', autoplay
						? 'Pause automatic slideshow'
						: 'Start automatic slideshow')}>`);

					if (autoplay) {
						$$renderer.push('<!--[0-->');
						Pause($$renderer, { class: 'ed-slider__playpause-icon' });
					} else {
						$$renderer.push('<!--[-1-->');
						Play($$renderer, { class: 'ed-slider__playpause-icon' });
					}

					$$renderer.push(`<!--]--></button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!hidden().hero) {
				$$renderer.push(`<!--[0--><section class="ed-wrap ed-hero svelte-156wvlk"><div class="ed-hero__body svelte-156wvlk"><span class="ed-eyebrow svelte-156wvlk">${$.escape(ed().hero.eyebrow)}</span> <h1 class="ed-display svelte-156wvlk">${$.escape(ed().hero.titleLead)} <em class="svelte-156wvlk">${$.escape(ed().hero.titleAccent)}</em></h1> <p class="ed-hero__text svelte-156wvlk">${$.escape(ed().hero.text)}</p> <div class="ed-hero__actions svelte-156wvlk"><a class="ed-btn svelte-156wvlk"${$.attr('href', ed().hero.primaryHref)}>${$.escape(ed().hero.primaryCta)}</a> <a class="ed-link svelte-156wvlk"${$.attr('href', ed().hero.secondaryHref)}>${$.escape(ed().hero.secondaryCta)} `);
				ArrowRight($$renderer, { class: 'ed-link__icon' });
				$$renderer.push(`<!----></a></div> `);

				if (ed().hero.note) {
					$$renderer.push(`<!--[0--><p class="ed-hero__note svelte-156wvlk">${$.escape(ed().hero.note)}</p>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="ed-hero__media svelte-156wvlk"><img${$.attr('src', ed().hero.image)}${$.attr('alt', ed().hero.imageAlt)}${$.attr('loading', heroSlides().length ? 'lazy' : 'eager')}${$.attr('fetchpriority', heroSlides().length ? 'auto' : 'high')} class="svelte-156wvlk"/></div></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (ed().marquee?.length && !hidden().marquee) {
				$$renderer.push(`<!--[0--><div class="ed-ribbon svelte-156wvlk"><div class="ed-wrap ed-ribbon__row svelte-156wvlk"><!--[-->`);

				const each_array_2 = $.ensure_array_like(ed().marquee);

				for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
					let item = each_array_2[i];

					if (i > 0) {
						$$renderer.push(`<!--[0--><span class="ed-ribbon__dot svelte-156wvlk" aria-hidden="true"></span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <span>${$.escape(item)}</span>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (categoryTiles().length && !hidden().categories) {
				$$renderer.push(`<!--[0--><section class="ed-wrap ed-section svelte-156wvlk"><header class="ed-head svelte-156wvlk"><div><span class="ed-eyebrow svelte-156wvlk">${$.escape(ed().categories.eyebrow)}</span> <h2 class="ed-display ed-head__title svelte-156wvlk">${$.escape(ed().categories.title)}</h2></div> <a class="ed-link svelte-156wvlk"${$.attr('href', ed().categories.viewAllHref)}>${$.escape(ed().categories.viewAll)} `);
				ArrowRight($$renderer, { class: 'ed-link__icon' });
				$$renderer.push(`<!----></a></header> <div class="ed-cats svelte-156wvlk"><!--[-->`);

				const each_array_3 = $.ensure_array_like(categoryTiles());

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let tile = each_array_3[$$index_3];

					$$renderer.push(`<a class="ed-cat svelte-156wvlk"${$.attr('href', tile.href)}><div class="ed-cat__media svelte-156wvlk">`);

					if (tile.image) {
						$$renderer.push(`<!--[0--><img${$.attr('src', tile.image)}${$.attr('alt', tile.label)} loading="lazy" class="svelte-156wvlk"/>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="ed-cat__placeholder svelte-156wvlk" aria-hidden="true"></div>`);
					}

					$$renderer.push(`<!--]--></div> <span class="ed-cat__label svelte-156wvlk">${$.escape(tile.label)} `);
					ArrowUpRight($$renderer, { class: 'ed-cat__icon' });
					$$renderer.push(`<!----></span></a>`);
				}

				$$renderer.push(`<!--]--></div></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!hidden().featured) {
				$$renderer.push(`<!--[0--><section class="ed-tint svelte-156wvlk"><div class="ed-wrap ed-section svelte-156wvlk"><header class="ed-head svelte-156wvlk"><div><span class="ed-eyebrow svelte-156wvlk">${$.escape(ed().featured.eyebrow)}</span> <h2 class="ed-display ed-head__title svelte-156wvlk">${$.escape(ed().featured.title)}</h2></div> <a class="ed-link svelte-156wvlk"${$.attr('href', ed().featured.viewAllHref)}>${$.escape(ed().featured.viewAll)} `);
				ArrowRight($$renderer, { class: 'ed-link__icon' });
				$$renderer.push(`<!----></a></header> `);

				if (loading) {
					$$renderer.push(`<!--[0--><div class="ed-products svelte-156wvlk"><!--[-->`);

					const each_array_4 = $.ensure_array_like(Array(8));

					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let _ = each_array_4[$$index_4];

						$$renderer.push(`<div class="ed-skel svelte-156wvlk">`);
						Skeleton($$renderer, { class: 'ed-skel__img' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-4 w-2/3 rounded' });
						$$renderer.push(`<!----> `);
						Skeleton($$renderer, { class: 'h-4 w-1/3 rounded' });
						$$renderer.push(`<!----></div>`);
					}

					$$renderer.push(`<!--]--></div>`);
				} else if (products().length) {
					$$renderer.push(`<!--[1--><div class="ed-products svelte-156wvlk"><!--[-->`);

					const each_array_5 = $.ensure_array_like(products());

					for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
						let product = each_array_5[$$index_5];

						ProductCard($$renderer, { product, aspectRatio: productAspect() });
					}

					$$renderer.push(`<!--]--></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="ed-empty svelte-156wvlk"><h3 class="ed-display svelte-156wvlk">${$.escape(themeContent.defaultHome.emptyTitle)}</h3> <p class="svelte-156wvlk">${$.escape(themeContent.defaultHome.emptyText)}</p> <a class="ed-btn svelte-156wvlk" href="/products">Browse the catalogue</a></div>`);
				}

				$$renderer.push(`<!--]--></div></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (pageBands().length) {
				$$renderer.push(`<!--[0--><section class="ed-wrap ed-section ed-bands svelte-156wvlk"><!--[-->`);

				const each_array_6 = $.ensure_array_like(pageBands());

				for (let $$index_7 = 0, $$length = each_array_6.length; $$index_7 < $$length; $$index_7++) {
					let band = each_array_6[$$index_7];

					$$renderer.push(`<div class="ed-band">`);

					if (band.title) {
						$$renderer.push(`<!--[0--><header class="ed-head svelte-156wvlk"><h2 class="ed-display ed-head__title svelte-156wvlk">${$.escape(band.title)}</h2></header>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <div${$.attr_class('ed-band__grid svelte-156wvlk', void 0, { 'ed-band__grid--carousel': band.carousel })}${$.attr_style(`--ed-band-cols: ${$.stringify(band.columns)}; --ed-band-aspect: ${$.stringify(band.aspect)}`)}><!--[-->`);

					const each_array_7 = $.ensure_array_like(band.items);

					for (let $$index_6 = 0, $$length = each_array_7.length; $$index_6 < $$length; $$index_6++) {
						let item = each_array_7[$$index_6];

						$.element(
							$$renderer,
							item.link ? 'a' : 'div',
							() => {
								$$renderer.push(` class="ed-band__item svelte-156wvlk"${$.attr('href', item.link || undefined)}`);
							},
							() => {
								$$renderer.push(`<div class="ed-band__media svelte-156wvlk"><img${$.attr('src', item.url)}${$.attr('alt', item.title || band.title || 'Banner')} loading="lazy" class="svelte-156wvlk"/></div> `);

								if (item.title) {
									$$renderer.push(`<!--[0--><span class="ed-band__label svelte-156wvlk">${$.escape(item.title)}</span>`);
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]-->`);
							}
						);
					}

					$$renderer.push(`<!--]--></div></div>`);
				}

				$$renderer.push(`<!--]--></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!hidden().banner) {
				$$renderer.push(`<!--[0--><section class="ed-wrap ed-banner svelte-156wvlk"><div class="ed-banner__media svelte-156wvlk"><img${$.attr('src', ed().banner.image)}${$.attr('alt', ed().banner.imageAlt)} loading="lazy" class="svelte-156wvlk"/></div> <div class="ed-banner__body svelte-156wvlk"><span class="ed-eyebrow svelte-156wvlk">${$.escape(ed().banner.eyebrow)}</span> <h2 class="ed-display ed-banner__title svelte-156wvlk">${$.escape(ed().banner.title)}</h2> <p class="svelte-156wvlk">${$.escape(ed().banner.text)}</p> <a class="ed-btn ed-btn--ghost svelte-156wvlk"${$.attr('href', ed().banner.href)}>${$.escape(ed().banner.cta)}</a></div></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!hidden().assurances) {
				$$renderer.push(`<!--[0--><section class="ed-wrap svelte-156wvlk"><div class="ed-assure svelte-156wvlk"><!--[-->`);

				const each_array_8 = $.ensure_array_like(ed().assurances);

				for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
					let a = each_array_8[$$index_8];
					const Icon = assuranceIcons[a.icon];

					$$renderer.push(`<div class="ed-assure__item svelte-156wvlk">`);

					if (Icon) {
						$$renderer.push('<!--[-->');
						Icon($$renderer, { class: 'ed-assure__icon' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` <div><p class="ed-assure__title svelte-156wvlk">${$.escape(a.title)}</p> <p class="ed-assure__text svelte-156wvlk">${$.escape(a.text)}</p></div></div>`);
				}

				$$renderer.push(`<!--]--></div></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!hidden().newsletter) {
				$$renderer.push(`<!--[0--><section class="ed-tint svelte-156wvlk"><div class="ed-wrap ed-news svelte-156wvlk"><span class="ed-eyebrow svelte-156wvlk">${$.escape(ed().newsletter.eyebrow)}</span> <h2 class="ed-display ed-news__title svelte-156wvlk">${$.escape(ed().newsletter.title)}</h2> <p class="ed-news__text svelte-156wvlk">${$.escape(ed().newsletter.text)}</p> `);

				if (subscribed) {
					$$renderer.push(`<!--[0--><p class="ed-news__thanks svelte-156wvlk">Thanks — you're on the list.</p>`);
				} else {
					$$renderer.push(`<!--[-1--><form class="ed-news__form svelte-156wvlk"><label class="sr-only svelte-156wvlk" for="ed-news-email">Email address</label> <input id="ed-news-email" type="email" required="" placeholder="you@example.com"${$.attr('value', email)} class="svelte-156wvlk"/> <button type="submit"${$.attr('disabled', subscribing, true)} class="svelte-156wvlk">${$.escape(subscribing ? 'Subscribing…' : ed().newsletter.cta)}</button></form>`);
				}

				$$renderer.push(`<!--]--> <p class="ed-news__privacy svelte-156wvlk">${$.escape(ed().newsletter.privacy)}</p></div></section>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}