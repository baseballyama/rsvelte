import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<link rel="preconnect" href="https://fonts.googleapis.com"/> <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/> <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;0,6..96,700;1,6..96,400&amp;family=Hanken+Grotesk:wght@400;500;600;700&amp;display=swap"/>`, 1);
var root_1 = $.from_html(`<source media="(max-width: 767px)"/>`);
var root_2 = $.from_html(`<source media="(max-width: 1199px)"/>`);
var root_3 = $.from_html(`<picture class="svelte-156wvlk"><!> <!> <img class="svelte-156wvlk"/></picture>`);
var root_4 = $.from_html(`<button type="button" class="ed-dot svelte-156wvlk"></button>`);
var root_5 = $.from_html(`<button type="button" class="ed-slider__arrow ed-slider__arrow--prev svelte-156wvlk" aria-label="Previous slide"><!></button> <button type="button" class="ed-slider__arrow ed-slider__arrow--next svelte-156wvlk" aria-label="Next slide"><!></button> <div class="ed-slider__dots svelte-156wvlk"><!> <button type="button" class="ed-slider__playpause svelte-156wvlk"><!></button></div>`, 1);
var root_6 = $.from_html(`<div class="ed-slider svelte-156wvlk" role="group" aria-roledescription="carousel" aria-label="Featured banners"><div class="ed-slider__track svelte-156wvlk"></div> <!></div>`);
var root_7 = $.from_html(`<p class="ed-hero__note svelte-156wvlk"> </p>`);
var root_8 = $.from_html(`<section class="ed-wrap ed-hero svelte-156wvlk"><div class="ed-hero__body svelte-156wvlk"><span class="ed-eyebrow svelte-156wvlk"> </span> <h1 class="ed-display svelte-156wvlk"> <em class="svelte-156wvlk"> </em></h1> <p class="ed-hero__text svelte-156wvlk"> </p> <div class="ed-hero__actions svelte-156wvlk"><a class="ed-btn svelte-156wvlk"> </a> <a class="ed-link svelte-156wvlk"> <!></a></div> <!></div> <div class="ed-hero__media svelte-156wvlk"><img class="svelte-156wvlk"/></div></section>`);
var root_9 = $.from_html(`<span class="ed-ribbon__dot svelte-156wvlk" aria-hidden="true"></span>`);
var root_10 = $.from_html(`<!> <span> </span>`, 1);
var root_11 = $.from_html(`<div class="ed-ribbon svelte-156wvlk"><div class="ed-wrap ed-ribbon__row svelte-156wvlk"></div></div>`);
var root_12 = $.from_html(`<img loading="lazy" class="svelte-156wvlk"/>`);
var root_13 = $.from_html(`<div class="ed-cat__placeholder svelte-156wvlk" aria-hidden="true"></div>`);
var root_14 = $.from_html(`<a class="ed-cat svelte-156wvlk"><div class="ed-cat__media svelte-156wvlk"><!></div> <span class="ed-cat__label svelte-156wvlk"> <!></span></a>`);
var root_15 = $.from_html(`<section class="ed-wrap ed-section svelte-156wvlk"><header class="ed-head svelte-156wvlk"><div><span class="ed-eyebrow svelte-156wvlk"> </span> <h2 class="ed-display ed-head__title svelte-156wvlk"> </h2></div> <a class="ed-link svelte-156wvlk"> <!></a></header> <div class="ed-cats svelte-156wvlk"></div></section>`);
var root_16 = $.from_html(`<div class="ed-skel svelte-156wvlk"><!> <!> <!></div>`);
var root_17 = $.from_html(`<div class="ed-products svelte-156wvlk"></div>`);
var root_18 = $.from_html(`<div class="ed-empty svelte-156wvlk"><h3 class="ed-display svelte-156wvlk"> </h3> <p class="svelte-156wvlk"> </p> <a class="ed-btn svelte-156wvlk" href="/products">Browse the catalogue</a></div>`);
var root_19 = $.from_html(`<section class="ed-tint svelte-156wvlk"><div class="ed-wrap ed-section svelte-156wvlk"><header class="ed-head svelte-156wvlk"><div><span class="ed-eyebrow svelte-156wvlk"> </span> <h2 class="ed-display ed-head__title svelte-156wvlk"> </h2></div> <a class="ed-link svelte-156wvlk"> <!></a></header> <!></div></section>`);
var root_20 = $.from_html(`<header class="ed-head svelte-156wvlk"><h2 class="ed-display ed-head__title svelte-156wvlk"> </h2></header>`);
var root_21 = $.from_html(`<span class="ed-band__label svelte-156wvlk"> </span>`);
var root_22 = $.from_html(`<div class="ed-band__media svelte-156wvlk"><img loading="lazy" class="svelte-156wvlk"/></div> <!>`, 1);
var root_23 = $.from_html(`<div class="ed-band"><!> <div></div></div>`);
var root_24 = $.from_html(`<section class="ed-wrap ed-section ed-bands svelte-156wvlk"></section>`);
var root_25 = $.from_html(`<section class="ed-wrap ed-banner svelte-156wvlk"><div class="ed-banner__media svelte-156wvlk"><img loading="lazy" class="svelte-156wvlk"/></div> <div class="ed-banner__body svelte-156wvlk"><span class="ed-eyebrow svelte-156wvlk"> </span> <h2 class="ed-display ed-banner__title svelte-156wvlk"> </h2> <p class="svelte-156wvlk"> </p> <a class="ed-btn ed-btn--ghost svelte-156wvlk"> </a></div></section>`);
var root_26 = $.from_html(`<div class="ed-assure__item svelte-156wvlk"><!> <div><p class="ed-assure__title svelte-156wvlk"> </p> <p class="ed-assure__text svelte-156wvlk"> </p></div></div>`);
var root_27 = $.from_html(`<section class="ed-wrap svelte-156wvlk"><div class="ed-assure svelte-156wvlk"></div></section>`);
var root_28 = $.from_html(`<p class="ed-news__thanks svelte-156wvlk">Thanks — you're on the list.</p>`);
var root_29 = $.from_html(`<form class="ed-news__form svelte-156wvlk"><label class="sr-only svelte-156wvlk" for="ed-news-email">Email address</label> <input id="ed-news-email" type="email" required="" placeholder="you@example.com" class="svelte-156wvlk"/> <button type="submit" class="svelte-156wvlk"> </button></form>`);
var root_30 = $.from_html(`<section class="ed-tint svelte-156wvlk"><div class="ed-wrap ed-news svelte-156wvlk"><span class="ed-eyebrow svelte-156wvlk"> </span> <h2 class="ed-display ed-news__title svelte-156wvlk"> </h2> <p class="ed-news__text svelte-156wvlk"> </p> <!> <p class="ed-news__privacy svelte-156wvlk"> </p></div></section>`);
var root_31 = $.from_html(`<div><!> <!> <!> <!> <!> <!> <!> <!> <!></div>`);

export default function DefaultHomepage($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.prop($$props, 'loading', 3, false),
		desktopBanners = $.prop($$props, 'desktopBanners', 19, () => []),
		tabletBanners = $.prop($$props, 'tabletBanners', 19, () => []),
		mobileBanners = $.prop($$props, 'mobileBanners', 19, () => []),
		pageSections = $.prop($$props, 'pageSections', 19, () => []);

	/** Merchant content from the admin `home` page — see ./page-inheritance.ts. */
	// Per-device content (admin cascade mobile → tablet → desktop). SSR renders the mobile
	// base layer (Googlebot is mobile-first); the viewport picks the real layer on mount.
	// Stores without device overrides resolve identically on every device — no flash.
	let contentDevice = $.state('mobile');

	const ed = $.derived(() => resolveEditorialForDevice($$props.themeContent, $.get(contentDevice)));

	// Admin-controlled per-section visibility (true = hidden), set on the store's Theme page.
	const hidden = $.derived(() => $.get(ed)?.hiddenSections ?? {});

	const productAspect = $.derived(() => `${$$props.aspectWidth || '4'} / ${$$props.aspectHeight || '5'}`);

	// Live categories take over the fallback tiles; capped at 4 for the balanced grid.
	const categoryTiles = $.derived(() => $$props.featuredCategories?.length
		? $$props.featuredCategories.slice(0, 4).map((c) => ({
			label: c?.name || c?.title || 'Shop',
			href: c?.slug ? `/${c.slug}` : c?.link || '/products',
			image: c?.image || c?.thumbnail || c?.img || ''
		}))
		: [] || []);

	// Products section source (admin Theme page): 'featured' uses the featured feed passed in
	// as props; 'latest' / 'popular' / 'category' fetch client-side. SSR renders the featured
	// feed and the configured source takes over on mount.
	let sourcedProducts = $.state(null);

	let sourceToken = 0;

	$.user_effect(() => {
		const source = $.get(ed)?.featured?.source ?? 'featured';
		const categoryId = $.get(ed)?.featured?.categoryId ?? '';
		const token = ++sourceToken;

		if (source === 'featured' || source === 'category' && !categoryId) {
			$.set(sourcedProducts, null);

			return;
		}

		(async () => {
			try {
				let res;

				if (source === 'category') {
					res = await productService.listRelatedProducts({ page: 1, categoryId });
				} else if (source === 'popular') {
					res = await productService.list({ page: 1, sort: '-popularity' });
				} else {
					res = await productService.list({ page: 1, sort: '-createdAt' });
				}

				if (token === sourceToken) $.set(sourcedProducts, res?.data || [], true);
			} catch {
				if (token === sourceToken) $.set(sourcedProducts, null);
			}
		})();
	});

	const products = $.derived(() => (($.get(sourcedProducts) ?? $$props.featuredProducts) || []).slice(0, 8));

	const assuranceIcons = {
		truck: Truck,
		returns: RotateCcw,
		shield: ShieldCheck,
		support: Headset
	};

	// --- Home-page inheritance (admin Pages → this theme). Empty unless the merchant has
	// curated banners/sections, so a store that hasn't touched Pages renders exactly as before.
	const homePage = $.derived(() => ({
		desktopBanners: desktopBanners(),
		tabletBanners: tabletBanners(),
		mobileBanners: mobileBanners(),
		sections: pageSections()
	}));

	// Device-independent: each slide carries both artworks and <picture> picks per viewport,
	// so this never re-resolves (and never double-downloads) when contentDevice changes.
	const heroSlides = $.derived(() => $.get(hidden).heroSlider ? [] : resolveHeroSlides($.get(homePage)));

	const pageBands = $.derived(() => $.get(hidden).pageSections
		? []
		: resolvePageBands($.get(homePage), $.get(contentDevice)));

	// Hero slider: native scroll-snap so touch swiping is free; the arrows, dots and autoplay
	// drive it with scrollTo and read the position back on scroll.
	let heroTrack = $.state(null);

	let heroIndex = $.state(0);
	let heroPaused = $.state(false);

	/** Read the live position rather than trusting heroIndex, which lags during the slide. */
	const currentSlide = () => $.get(heroTrack)
		? Math.round($.get(heroTrack).scrollLeft / Math.max(1, $.get(heroTrack).clientWidth))
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

		if ($.get(heroTrack)) $.get(heroTrack).style.scrollSnapType = '';
	};

	const slideTo = (index) => {
		const track = $.get(heroTrack);

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
	const stepSlide = (delta) => slideTo((currentSlide() + delta + $.get(heroSlides).length) % $.get(heroSlides).length);

	const onHeroScroll = () => {
		if (!$.get(heroTrack)) return;

		$.set(heroIndex, currentSlide(), true);
	};

	// Content that moves automatically for more than five seconds needs a real pause control
	// (WCAG 2.2.2) — hover/focus is not one on touch, where most of the traffic is — and must
	// not start at all for a visitor who asked for reduced motion. `autoplay` drives both: it
	// starts off when the media query matches, and the toggle beside the dots flips it.
	let autoplay = $.state(true);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) $.set(autoplay, false);
	});

	// Autoplay. Hovering or focusing the slider flips heroPaused, which tears this effect down
	// and clears the timer, so the next slide never fires while the pointer is over it.
	// A hidden tab is skipped rather than silently queueing advances nobody can see.
	$.user_effect(() => {
		if ($.get(heroSlides).length < 2 || $.get(heroPaused) || !$.get(autoplay)) return;

		const timer = setInterval(
			() => {
				if (!document.hidden) stepSlide(1);
			},
			6000
		);

		return () => clearInterval(timer);
	});

	// A tab hidden mid-slide would freeze the tween (no frames) and leave snapping off, so
	// finish immediately on the way out. Also stops any in-flight tween on unmount.
	$.user_effect(() => {
		const onHide = () => {
			if (!document.hidden || !slideFrame || !$.get(heroTrack)) return;

			const track = $.get(heroTrack);

			cancelSlide();
			track.scrollLeft = track.clientWidth * Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
		};

		document.addEventListener('visibilitychange', onHide);

		return () => {
			document.removeEventListener('visibilitychange', onHide);
			cancelSlide();
		};
	});

	let inView = $.state(false);

	onMount(() => {
		$.set(inView, true);

		// Content-layer breakpoints (independent of the CSS layout breakpoints): they match
		// the admin preview's simulated devices — mobile <768, tablet 768–1199, desktop ≥1200.
		const mqTablet = window.matchMedia('(min-width: 768px)');

		const mqDesktop = window.matchMedia('(min-width: 1200px)');

		const pick = () => {
			$.set(contentDevice, mqDesktop.matches ? 'desktop' : mqTablet.matches ? 'tablet' : 'mobile', true);
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
	let email = $.state('');
	let subscribed = $.state(false);
	let subscribing = $.state(false);

	async function onSubscribe(e) {
		e.preventDefault();

		const parsed = z.string().email().safeParse($.get(email).trim());

		if (!parsed.success) {
			toast.error('Please enter a valid email address');

			return;
		}

		$.set(subscribing, true);

		try {
			await storeService.post('/api/newsletter/subscribe', {
				email: $.get(email).trim(),
				customerId: userState?.user?.userId || null
			});

			klaviyoIdentify({ email: $.get(email).trim() });
			klaviyoSubscribe($.get(email).trim(), $.get(klaviyoConfig));
			$.set(subscribed, true);
		} catch(err) {
			toast.error(err?.message || 'Subscription failed, please try again');
		} finally {
			$.set(subscribing, false);
		}
	}

	var fragment_1 = $.comment();

	$.head('156wvlk', ($$anchor) => {
		var fragment = root();

		$.next(4);
		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	{
		var consequent_21 = ($$anchor) => {
			var div = root_31();
			let classes;
			var node_1 = $.child(div);

			{
				var consequent_4 = ($$anchor) => {
					var div_1 = root_6();
					var div_2 = $.child(div_1);

					$.each(div_2, 21, () => $.get(heroSlides), $.index, ($$anchor, slide, i) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						$.element(node_2, () => $.get(slide).link ? 'a' : 'div', false, ($$element, $$anchor) => {
							$.attribute_effect(
								$$element,
								() => ({
									class: 'ed-slide',
									href: $.get(slide).link || undefined,
									'aria-label': $.get(slide).title || undefined
								}),
								void 0,
								void 0,
								void 0,
								'svelte-156wvlk'
							);

							var picture = root_3();
							var node_3 = $.child(picture);

							{
								var consequent = ($$anchor) => {
									var source_1 = root_1();

									$.template_effect(() => $.set_attribute(source_1, 'srcset', $.get(slide).mobileUrl));
									$.append($$anchor, source_1);
								};

								$.if(node_3, ($$render) => {
									if ($.get(slide).mobileUrl !== $.get(slide).url) $$render(consequent);
								});
							}

							var node_4 = $.sibling(node_3, 2);

							{
								var consequent_1 = ($$anchor) => {
									var source_2 = root_2();

									$.template_effect(() => $.set_attribute(source_2, 'srcset', $.get(slide).tabletUrl));
									$.append($$anchor, source_2);
								};

								$.if(node_4, ($$render) => {
									if ($.get(slide).tabletUrl !== $.get(slide).url) $$render(consequent_1);
								});
							}

							var img = $.sibling(node_4, 2);

							$.set_attribute(img, 'loading', i === 0 ? 'eager' : 'lazy');
							$.set_attribute(img, 'fetchpriority', i === 0 ? 'high' : 'auto');
							$.reset(picture);

							$.template_effect(() => {
								$.set_attribute(img, 'src', $.get(slide).url);
								$.set_attribute(img, 'alt', $.get(slide).title || 'Featured banner');
							});

							$.append($$anchor, picture);
						});

						$.append($$anchor, fragment_2);
					});

					$.reset(div_2);
					$.bind_this(div_2, ($$value) => $.set(heroTrack, $$value), () => $.get(heroTrack));

					var node_5 = $.sibling(div_2, 2);

					{
						var consequent_3 = ($$anchor) => {
							var fragment_3 = root_5();
							var button = $.first_child(fragment_3);
							var node_6 = $.child(button);

							ChevronLeft(node_6, { class: 'ed-slider__arrow-icon' });
							$.reset(button);

							var button_1 = $.sibling(button, 2);
							var node_7 = $.child(button_1);

							ChevronRight(node_7, { class: 'ed-slider__arrow-icon' });
							$.reset(button_1);

							var div_3 = $.sibling(button_1, 2);
							var node_8 = $.child(div_3);

							$.each(node_8, 17, () => $.get(heroSlides), $.index, ($$anchor, _, i) => {
								var button_2 = root_4();

								$.set_attribute(button_2, 'aria-label', `Go to slide ${i + 1}`);
								$.template_effect(() => $.set_attribute(button_2, 'aria-current', $.get(heroIndex) === i));
								$.delegated('click', button_2, () => slideTo(i));
								$.append($$anchor, button_2);
							});

							var button_3 = $.sibling(node_8, 2);
							var node_9 = $.child(button_3);

							{
								var consequent_2 = ($$anchor) => {
									Pause($$anchor, { class: 'ed-slider__playpause-icon' });
								};

								var alternate = ($$anchor) => {
									Play($$anchor, { class: 'ed-slider__playpause-icon' });
								};

								$.if(node_9, ($$render) => {
									if ($.get(autoplay)) $$render(consequent_2); else $$render(alternate, -1);
								});
							}

							$.reset(button_3);
							$.reset(div_3);

							$.template_effect(() => {
								$.set_attribute(button_3, 'aria-pressed', !$.get(autoplay));

								$.set_attribute(button_3, 'aria-label', $.get(autoplay)
									? 'Pause automatic slideshow'
									: 'Start automatic slideshow');
							});

							$.delegated('click', button, () => stepSlide(-1));
							$.delegated('click', button_1, () => stepSlide(1));
							$.delegated('click', button_3, () => $.set(autoplay, !$.get(autoplay)));
							$.append($$anchor, fragment_3);
						};

						$.if(node_5, ($$render) => {
							if ($.get(heroSlides).length > 1) $$render(consequent_3);
						});
					}

					$.reset(div_1);
					$.event('mouseenter', div_1, () => $.set(heroPaused, true));
					$.event('mouseleave', div_1, () => $.set(heroPaused, false));
					$.delegated('focusin', div_1, () => $.set(heroPaused, true));
					$.delegated('focusout', div_1, () => $.set(heroPaused, false));
					$.delegated('pointerdown', div_1, cancelSlide);
					$.event('scroll', div_2, onHeroScroll);
					$.append($$anchor, div_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(heroSlides).length) $$render(consequent_4);
				});
			}

			var node_10 = $.sibling(node_1, 2);

			{
				var consequent_6 = ($$anchor) => {
					var section = root_8();
					var div_4 = $.child(section);
					var span = $.child(div_4);
					var text = $.only_child(span, true);
					var h1 = $.sibling(span, 2);
					var text_1 = $.child(h1);
					var em = $.sibling(text_1);
					var text_2 = $.only_child(em, true);

					$.reset(h1);

					var p_1 = $.sibling(h1, 2);
					var text_3 = $.only_child(p_1, true);
					var div_5 = $.sibling(p_1, 2);
					var a_1 = $.child(div_5);
					var text_4 = $.only_child(a_1, true);
					var a_2 = $.sibling(a_1, 2);
					var text_5 = $.child(a_2);
					var node_11 = $.sibling(text_5);

					ArrowRight(node_11, { class: 'ed-link__icon' });
					$.reset(a_2);
					$.reset(div_5);

					var node_12 = $.sibling(div_5, 2);

					{
						var consequent_5 = ($$anchor) => {
							var p_2 = root_7();
							var text_6 = $.only_child(p_2, true);

							$.template_effect(() => $.set_text(text_6, $.get(ed).hero.note));
							$.append($$anchor, p_2);
						};

						$.if(node_12, ($$render) => {
							if ($.get(ed).hero.note) $$render(consequent_5);
						});
					}

					$.reset(div_4);

					var div_6 = $.sibling(div_4, 2);
					var img_1 = $.only_child(div_6);

					$.reset(section);

					$.template_effect(() => {
						$.set_text(text, $.get(ed).hero.eyebrow);
						$.set_text(text_1, `${$.get(ed).hero.titleLead ?? ''} `);
						$.set_text(text_2, $.get(ed).hero.titleAccent);
						$.set_text(text_3, $.get(ed).hero.text);
						$.set_attribute(a_1, 'href', $.get(ed).hero.primaryHref);
						$.set_text(text_4, $.get(ed).hero.primaryCta);
						$.set_attribute(a_2, 'href', $.get(ed).hero.secondaryHref);
						$.set_text(text_5, `${$.get(ed).hero.secondaryCta ?? ''} `);
						$.set_attribute(img_1, 'src', $.get(ed).hero.image);
						$.set_attribute(img_1, 'alt', $.get(ed).hero.imageAlt);
						$.set_attribute(img_1, 'loading', $.get(heroSlides).length ? 'lazy' : 'eager');
						$.set_attribute(img_1, 'fetchpriority', $.get(heroSlides).length ? 'auto' : 'high');
					});

					$.append($$anchor, section);
				};

				$.if(node_10, ($$render) => {
					if (!$.get(hidden).hero) $$render(consequent_6);
				});
			}

			var node_13 = $.sibling(node_10, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_7 = root_11();
					var div_8 = $.child(div_7);

					$.each(div_8, 21, () => $.get(ed).marquee, $.index, ($$anchor, item, i) => {
						var fragment_6 = root_10();
						var node_14 = $.first_child(fragment_6);

						{
							var consequent_7 = ($$anchor) => {
								var span_1 = root_9();

								$.append($$anchor, span_1);
							};

							$.if(node_14, ($$render) => {
								if (i > 0) $$render(consequent_7);
							});
						}

						var span_2 = $.sibling(node_14, 2);
						var text_7 = $.only_child(span_2, true);

						$.template_effect(() => $.set_text(text_7, $.get(item)));
						$.append($$anchor, fragment_6);
					});

					$.reset(div_8);
					$.reset(div_7);
					$.append($$anchor, div_7);
				};

				$.if(node_13, ($$render) => {
					if ($.get(ed).marquee?.length && !$.get(hidden).marquee) $$render(consequent_8);
				});
			}

			var node_15 = $.sibling(node_13, 2);

			{
				var consequent_10 = ($$anchor) => {
					var section_1 = root_15();
					var header = $.child(section_1);
					var div_9 = $.child(header);
					var span_3 = $.child(div_9);
					var text_8 = $.only_child(span_3, true);
					var h2 = $.sibling(span_3, 2);
					var text_9 = $.only_child(h2, true);

					$.reset(div_9);

					var a_3 = $.sibling(div_9, 2);
					var text_10 = $.child(a_3);
					var node_16 = $.sibling(text_10);

					ArrowRight(node_16, { class: 'ed-link__icon' });
					$.reset(a_3);
					$.reset(header);

					var div_10 = $.sibling(header, 2);

					$.each(div_10, 21, () => $.get(categoryTiles), $.index, ($$anchor, tile) => {
						var a_4 = root_14();
						var div_11 = $.child(a_4);
						var node_17 = $.child(div_11);

						{
							var consequent_9 = ($$anchor) => {
								var img_2 = root_12();

								$.template_effect(() => {
									$.set_attribute(img_2, 'src', $.get(tile).image);
									$.set_attribute(img_2, 'alt', $.get(tile).label);
								});

								$.append($$anchor, img_2);
							};

							var alternate_1 = ($$anchor) => {
								var div_12 = root_13();

								$.append($$anchor, div_12);
							};

							$.if(node_17, ($$render) => {
								if ($.get(tile).image) $$render(consequent_9); else $$render(alternate_1, -1);
							});
						}

						$.reset(div_11);

						var span_4 = $.sibling(div_11, 2);
						var text_11 = $.child(span_4);
						var node_18 = $.sibling(text_11);

						ArrowUpRight(node_18, { class: 'ed-cat__icon' });
						$.reset(span_4);
						$.reset(a_4);

						$.template_effect(() => {
							$.set_attribute(a_4, 'href', $.get(tile).href);
							$.set_text(text_11, `${$.get(tile).label ?? ''} `);
						});

						$.append($$anchor, a_4);
					});

					$.reset(div_10);
					$.reset(section_1);

					$.template_effect(() => {
						$.set_text(text_8, $.get(ed).categories.eyebrow);
						$.set_text(text_9, $.get(ed).categories.title);
						$.set_attribute(a_3, 'href', $.get(ed).categories.viewAllHref);
						$.set_text(text_10, `${$.get(ed).categories.viewAll ?? ''} `);
					});

					$.append($$anchor, section_1);
				};

				$.if(node_15, ($$render) => {
					if ($.get(categoryTiles).length && !$.get(hidden).categories) $$render(consequent_10);
				});
			}

			var node_19 = $.sibling(node_15, 2);

			{
				var consequent_13 = ($$anchor) => {
					var section_2 = root_19();
					var div_13 = $.child(section_2);
					var header_1 = $.child(div_13);
					var div_14 = $.child(header_1);
					var span_5 = $.child(div_14);
					var text_12 = $.only_child(span_5, true);
					var h2_1 = $.sibling(span_5, 2);
					var text_13 = $.only_child(h2_1, true);

					$.reset(div_14);

					var a_5 = $.sibling(div_14, 2);
					var text_14 = $.child(a_5);
					var node_20 = $.sibling(text_14);

					ArrowRight(node_20, { class: 'ed-link__icon' });
					$.reset(a_5);
					$.reset(header_1);

					var node_21 = $.sibling(header_1, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_15 = root_17();

							$.each(div_15, 20, () => Array(8), $.index, ($$anchor, _) => {
								var div_16 = root_16();
								var node_22 = $.child(div_16);

								Skeleton(node_22, { class: 'ed-skel__img' });

								var node_23 = $.sibling(node_22, 2);

								Skeleton(node_23, { class: 'h-4 w-2/3 rounded' });

								var node_24 = $.sibling(node_23, 2);

								Skeleton(node_24, { class: 'h-4 w-1/3 rounded' });
								$.reset(div_16);
								$.append($$anchor, div_16);
							});

							$.reset(div_15);
							$.append($$anchor, div_15);
						};

						var consequent_12 = ($$anchor) => {
							var div_17 = root_17();

							$.each(div_17, 21, () => $.get(products), (product) => product.id || product.slug, ($$anchor, product) => {
								ProductCard($$anchor, {
									get product() {
										return $.get(product);
									},

									get aspectRatio() {
										return $.get(productAspect);
									}
								});
							});

							$.reset(div_17);
							$.append($$anchor, div_17);
						};

						var alternate_2 = ($$anchor) => {
							var div_18 = root_18();
							var h3 = $.child(div_18);
							var text_15 = $.only_child(h3, true);
							var p_3 = $.sibling(h3, 2);
							var text_16 = $.only_child(p_3, true);

							$.next(2);
							$.reset(div_18);

							$.template_effect(() => {
								$.set_text(text_15, $$props.themeContent.defaultHome.emptyTitle);
								$.set_text(text_16, $$props.themeContent.defaultHome.emptyText);
							});

							$.append($$anchor, div_18);
						};

						$.if(node_21, ($$render) => {
							if (loading()) $$render(consequent_11); else if ($.get(products).length) $$render(consequent_12, 1); else $$render(alternate_2, -1);
						});
					}

					$.reset(div_13);
					$.reset(section_2);

					$.template_effect(() => {
						$.set_text(text_12, $.get(ed).featured.eyebrow);
						$.set_text(text_13, $.get(ed).featured.title);
						$.set_attribute(a_5, 'href', $.get(ed).featured.viewAllHref);
						$.set_text(text_14, `${$.get(ed).featured.viewAll ?? ''} `);
					});

					$.append($$anchor, section_2);
				};

				$.if(node_19, ($$render) => {
					if (!$.get(hidden).featured) $$render(consequent_13);
				});
			}

			var node_25 = $.sibling(node_19, 2);

			{
				var consequent_16 = ($$anchor) => {
					var section_3 = root_24();

					$.each(section_3, 21, () => $.get(pageBands), $.index, ($$anchor, band) => {
						var div_19 = root_23();
						var node_26 = $.child(div_19);

						{
							var consequent_14 = ($$anchor) => {
								var header_2 = root_20();
								var h2_2 = $.child(header_2);
								var text_17 = $.only_child(h2_2, true);

								$.reset(header_2);
								$.template_effect(() => $.set_text(text_17, $.get(band).title));
								$.append($$anchor, header_2);
							};

							$.if(node_26, ($$render) => {
								if ($.get(band).title) $$render(consequent_14);
							});
						}

						var div_20 = $.sibling(node_26, 2);
						let classes_1;

						$.each(div_20, 21, () => $.get(band).items, $.index, ($$anchor, item) => {
							var fragment_8 = $.comment();
							var node_27 = $.first_child(fragment_8);

							$.element(node_27, () => $.get(item).link ? 'a' : 'div', false, ($$element_1, $$anchor) => {
								$.attribute_effect($$element_1, () => ({ class: 'ed-band__item', href: $.get(item).link || undefined }), void 0, void 0, void 0, 'svelte-156wvlk');

								var fragment_9 = root_22();
								var div_21 = $.first_child(fragment_9);
								var img_3 = $.only_child(div_21);
								var node_28 = $.sibling(div_21, 2);

								{
									var consequent_15 = ($$anchor) => {
										var span_6 = root_21();
										var text_18 = $.only_child(span_6, true);

										$.template_effect(() => $.set_text(text_18, $.get(item).title));
										$.append($$anchor, span_6);
									};

									$.if(node_28, ($$render) => {
										if ($.get(item).title) $$render(consequent_15);
									});
								}

								$.template_effect(() => {
									$.set_attribute(img_3, 'src', $.get(item).url);
									$.set_attribute(img_3, 'alt', $.get(item).title || $.get(band).title || 'Banner');
								});

								$.append($$anchor, fragment_9);
							});

							$.append($$anchor, fragment_8);
						});

						$.reset(div_20);
						$.reset(div_19);

						$.template_effect(() => {
							classes_1 = $.set_class(div_20, 1, 'ed-band__grid svelte-156wvlk', null, classes_1, { 'ed-band__grid--carousel': $.get(band).carousel });
							$.set_style(div_20, `--ed-band-cols: ${$.get(band).columns ?? ''}; --ed-band-aspect: ${$.get(band).aspect ?? ''}`);
						});

						$.append($$anchor, div_19);
					});

					$.reset(section_3);
					$.append($$anchor, section_3);
				};

				$.if(node_25, ($$render) => {
					if ($.get(pageBands).length) $$render(consequent_16);
				});
			}

			var node_29 = $.sibling(node_25, 2);

			{
				var consequent_17 = ($$anchor) => {
					var section_4 = root_25();
					var div_22 = $.child(section_4);
					var img_4 = $.only_child(div_22);
					var div_23 = $.sibling(div_22, 2);
					var span_7 = $.child(div_23);
					var text_19 = $.only_child(span_7, true);
					var h2_3 = $.sibling(span_7, 2);
					var text_20 = $.only_child(h2_3, true);
					var p_4 = $.sibling(h2_3, 2);
					var text_21 = $.only_child(p_4, true);
					var a_6 = $.sibling(p_4, 2);
					var text_22 = $.only_child(a_6, true);

					$.reset(div_23);
					$.reset(section_4);

					$.template_effect(() => {
						$.set_attribute(img_4, 'src', $.get(ed).banner.image);
						$.set_attribute(img_4, 'alt', $.get(ed).banner.imageAlt);
						$.set_text(text_19, $.get(ed).banner.eyebrow);
						$.set_text(text_20, $.get(ed).banner.title);
						$.set_text(text_21, $.get(ed).banner.text);
						$.set_attribute(a_6, 'href', $.get(ed).banner.href);
						$.set_text(text_22, $.get(ed).banner.cta);
					});

					$.append($$anchor, section_4);
				};

				$.if(node_29, ($$render) => {
					if (!$.get(hidden).banner) $$render(consequent_17);
				});
			}

			var node_30 = $.sibling(node_29, 2);

			{
				var consequent_18 = ($$anchor) => {
					var section_5 = root_27();
					var div_24 = $.child(section_5);

					$.each(div_24, 21, () => $.get(ed).assurances, $.index, ($$anchor, a) => {
						const Icon = $.derived(() => assuranceIcons[$.get(a).icon]);
						var div_25 = root_26();
						var node_31 = $.child(div_25);

						$.component(node_31, () => $.get(Icon), ($$anchor, Icon_1) => {
							Icon_1($$anchor, { class: 'ed-assure__icon' });
						});

						var div_26 = $.sibling(node_31, 2);
						var p_5 = $.child(div_26);
						var text_23 = $.only_child(p_5, true);
						var p_6 = $.sibling(p_5, 2);
						var text_24 = $.only_child(p_6, true);

						$.reset(div_26);
						$.reset(div_25);

						$.template_effect(() => {
							$.set_text(text_23, $.get(a).title);
							$.set_text(text_24, $.get(a).text);
						});

						$.append($$anchor, div_25);
					});

					$.reset(div_24);
					$.reset(section_5);
					$.append($$anchor, section_5);
				};

				$.if(node_30, ($$render) => {
					if (!$.get(hidden).assurances) $$render(consequent_18);
				});
			}

			var node_32 = $.sibling(node_30, 2);

			{
				var consequent_20 = ($$anchor) => {
					var section_6 = root_30();
					var div_27 = $.child(section_6);
					var span_8 = $.child(div_27);
					var text_25 = $.only_child(span_8, true);
					var h2_4 = $.sibling(span_8, 2);
					var text_26 = $.only_child(h2_4, true);
					var p_7 = $.sibling(h2_4, 2);
					var text_27 = $.only_child(p_7, true);
					var node_33 = $.sibling(p_7, 2);

					{
						var consequent_19 = ($$anchor) => {
							var p_8 = root_28();

							$.append($$anchor, p_8);
						};

						var alternate_3 = ($$anchor) => {
							var form = root_29();
							var input = $.sibling($.child(form), 2);

							$.remove_input_defaults(input);

							var button_4 = $.sibling(input, 2);
							var text_28 = $.only_child(button_4, true);

							$.reset(form);

							$.template_effect(() => {
								button_4.disabled = $.get(subscribing);
								$.set_text(text_28, $.get(subscribing) ? 'Subscribing…' : $.get(ed).newsletter.cta);
							});

							$.event('submit', form, onSubscribe);
							$.bind_value(input, () => $.get(email), ($$value) => $.set(email, $$value));
							$.append($$anchor, form);
						};

						$.if(node_33, ($$render) => {
							if ($.get(subscribed)) $$render(consequent_19); else $$render(alternate_3, -1);
						});
					}

					var p_9 = $.sibling(node_33, 2);
					var text_29 = $.only_child(p_9, true);

					$.reset(div_27);
					$.reset(section_6);

					$.template_effect(() => {
						$.set_text(text_25, $.get(ed).newsletter.eyebrow);
						$.set_text(text_26, $.get(ed).newsletter.title);
						$.set_text(text_27, $.get(ed).newsletter.text);
						$.set_text(text_29, $.get(ed).newsletter.privacy);
					});

					$.append($$anchor, section_6);
				};

				$.if(node_32, ($$render) => {
					if (!$.get(hidden).newsletter) $$render(consequent_20);
				});
			}

			$.reset(div);
			$.template_effect(() => classes = $.set_class(div, 1, 'ed svelte-156wvlk', null, classes, { 'is-in': $.get(inView) }));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(ed)) $$render(consequent_21);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}

$.delegate(['focusin', 'focusout', 'pointerdown', 'click']);