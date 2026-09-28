import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	ArrowRight,
	Award,
	BookOpen,
	CalendarCheck,
	ChefHat,
	Circle,
	Clock,
	Flame,
	Heart,
	Leaf,
	Lock,
	Mail,
	MapPin,
	Phone,
	Play,
	Plus,
	Quote,
	Search,
	Send,
	ShoppingCart,
	Star,
	Truck,
	Users,
	Utensils,
	Zap
} from '@lucide/svelte';

import { untrack } from 'svelte';
import { Skeleton } from '$lib/components/ui/skeleton/index.js';
import { formatPrice } from '$lib/core/utils/index.js';
import { themeImage } from '../placeholder.js';

var root = $.from_html(`<i class="svelte-1pdq8kk"></i>`);
var root_1 = $.from_html(`<div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> <em class="svelte-1pdq8kk"> </em></strong><span class="svelte-1pdq8kk"> </span></div> <!>`, 1);
var root_2 = $.from_html(`<div><span><!></span> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></div></div>`);
var root_3 = $.from_html(`<span class="svelte-1pdq8kk"><!> </span>`);
var root_4 = $.from_html(`<div class="category-grid svelte-1pdq8kk"></div>`);
var root_5 = $.from_html(`<img class="svelte-1pdq8kk"/>`);
var root_6 = $.from_html(`<a class="category-card svelte-1pdq8kk"><!> <strong class="svelte-1pdq8kk"> </strong> <span class="svelte-1pdq8kk"> </span></a>`);
var root_7 = $.from_html(`<div class="theme-empty-state svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> <span class="svelte-1pdq8kk"> </span></div>`);
var root_8 = $.from_html(`<div class="svelte-1pdq8kk"><span><!></span> <p class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></p></div>`);
var root_9 = $.from_html(`<button type="button"> </button>`);
var root_10 = $.from_html(`<div class="menu-card svelte-1pdq8kk"><!> <div class="menu-content svelte-1pdq8kk"><!><!></div></div>`);
var root_11 = $.from_html(`<div class="menu-grid svelte-1pdq8kk"></div>`);
var root_12 = $.from_html(`<em class="svelte-1pdq8kk"> </em>`);
var root_13 = $.from_html(`<small class="svelte-1pdq8kk"><!> </small>`);
var root_14 = $.from_html(`<a class="menu-card svelte-1pdq8kk"><div class="menu-image svelte-1pdq8kk"><img class="svelte-1pdq8kk"/> <!> <span class="menu-heart svelte-1pdq8kk"><!></span></div> <div class="menu-content svelte-1pdq8kk"><p class="svelte-1pdq8kk"> </p> <h3 class="svelte-1pdq8kk"> </h3> <span class="menu-desc svelte-1pdq8kk"> </span> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> <!> <b class="svelte-1pdq8kk"><!></b></div></div></a>`);
var root_15 = $.from_html(`<a href="/products" class="gallery-item svelte-1pdq8kk"><img class="svelte-1pdq8kk"/> <span class="svelte-1pdq8kk"><!> </span></a>`);
var root_16 = $.from_html(`<div class="timeline-item svelte-1pdq8kk"><div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong></div> <span class="svelte-1pdq8kk"></span> <div class="svelte-1pdq8kk"><h3 class="svelte-1pdq8kk"> </h3><p class="svelte-1pdq8kk"> </p></div></div>`);
var root_17 = $.from_html(`<div class="chef-card svelte-1pdq8kk"><img class="svelte-1pdq8kk"/> <div class="svelte-1pdq8kk"><h3 class="svelte-1pdq8kk"> </h3> <span class="svelte-1pdq8kk"> </span></div></div>`);
var root_18 = $.from_html(`<div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk"><!> </span> <strong><i></i> </strong></div>`);
var root_19 = $.from_html(`<div class="testimonial-card svelte-1pdq8kk"><!> <div class="stars svelte-1pdq8kk"><!><!><!><!><!></div> <p class="svelte-1pdq8kk"> </p> <div class="testimonial-author svelte-1pdq8kk"><img class="svelte-1pdq8kk"/> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></div></div></div>`);
var root_20 = $.from_html(`<option class="svelte-1pdq8kk"> </option>`);
var root_21 = $.from_html(`<p class="svelte-1pdq8kk"><!> <!></p>`);
var root_22 = $.from_html(`<article class="blog-card svelte-1pdq8kk"><div class="blog-image svelte-1pdq8kk"><img class="svelte-1pdq8kk"/> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></div></div> <div class="blog-body svelte-1pdq8kk"><span class="svelte-1pdq8kk"> </span> <h3 class="svelte-1pdq8kk"><a href="/blog" class="svelte-1pdq8kk"> </a></h3> <!> <a href="/blog" class="svelte-1pdq8kk"> <!></a></div></article>`);
var root_23 = $.from_html(`<section class="wine-hero svelte-1pdq8kk" id="hero"><div class="hero-shape hero-shape-one svelte-1pdq8kk"></div> <div class="hero-shape hero-shape-two svelte-1pdq8kk"></div> <div class="hero-bg-text svelte-1pdq8kk"> </div> <div class="wine-container hero-grid svelte-1pdq8kk"><div class="hero-copy svelte-1pdq8kk"><div class="hero-badge svelte-1pdq8kk"><span class="hero-badge-icon svelte-1pdq8kk"><!></span> <span class="svelte-1pdq8kk"> </span></div> <h1 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span><br class="svelte-1pdq8kk"/> </h1> <p class="hero-text svelte-1pdq8kk"> </p> <div class="hero-actions svelte-1pdq8kk"><a href="/products" class="wine-button primary svelte-1pdq8kk"><!> </a> <a href="/about-us" class="story-button svelte-1pdq8kk"><span class="svelte-1pdq8kk"><!></span> </a></div> <div class="hero-stats svelte-1pdq8kk" aria-label="Restaurant highlights"></div></div> <div class="hero-plate svelte-1pdq8kk"><div class="plate-ring svelte-1pdq8kk"><img class="svelte-1pdq8kk"/></div> <!></div></div></section> <div class="ticker svelte-1pdq8kk" aria-label="Popular menu categories"><div class="ticker-track svelte-1pdq8kk"></div></div> <section class="wine-section category-section svelte-1pdq8kk" id="category"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div> <p class="svelte-1pdq8kk"> </p></div> <!></div></section> <section class="wine-section svelte-1pdq8kk" id="about"><div class="wine-container story-grid svelte-1pdq8kk"><div class="story-visual svelte-1pdq8kk"><div class="story-photo svelte-1pdq8kk"><img class="svelte-1pdq8kk"/></div> <img class="story-photo-small svelte-1pdq8kk"/> <div class="experience-badge svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></div></div> <div class="svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <br class="svelte-1pdq8kk"/><span class="svelte-1pdq8kk"> </span></h2> <div class="section-line left svelte-1pdq8kk"></div> <p class="body-copy svelte-1pdq8kk"> </p> <div class="feature-list svelte-1pdq8kk"></div> <a href="/products" class="wine-button primary svelte-1pdq8kk"><!> </a></div></div></section> <section class="wine-section menu-section svelte-1pdq8kk" id="menu"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="filter-row svelte-1pdq8kk" aria-label="Menu filters"></div> <!> <div class="center-action svelte-1pdq8kk"><a href="/products" class="wine-button primary svelte-1pdq8kk"><!> </a></div></div></section> <section class="special-section svelte-1pdq8kk" id="special"><div class="special-bg svelte-1pdq8kk"></div> <div class="wine-container offer-grid svelte-1pdq8kk"><div class="svelte-1pdq8kk"><span class="special-tag svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <p class="svelte-1pdq8kk"> </p> <div class="countdown svelte-1pdq8kk" aria-label="Offer countdown"><div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></div> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></div> <div class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong><span class="svelte-1pdq8kk"> </span></div></div> <a href="/products" class="wine-button primary svelte-1pdq8kk"><!> </a></div> <div class="special-image svelte-1pdq8kk"><div class="special-glow svelte-1pdq8kk"></div> <img class="svelte-1pdq8kk"/> <div class="price-badge svelte-1pdq8kk"><span class="svelte-1pdq8kk"> </span><strong class="svelte-1pdq8kk"> </strong></div></div></div></section> <section class="wine-section gallery-section svelte-1pdq8kk" id="gallery"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="gallery-grid svelte-1pdq8kk"></div></div></section> <section class="wine-section history-section svelte-1pdq8kk" id="history"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="timeline svelte-1pdq8kk"></div></div></section> <section class="wine-section chefs-section svelte-1pdq8kk" id="chefs"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="chef-grid svelte-1pdq8kk"></div></div></section> <section class="hours-section svelte-1pdq8kk" id="hours"><div class="hours-bg svelte-1pdq8kk"></div> <div class="wine-container svelte-1pdq8kk"><div class="section-heading hours-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="hours-grid svelte-1pdq8kk"><div class="hours-card svelte-1pdq8kk"></div> <div class="hours-cta svelte-1pdq8kk"><!> <h3 class="svelte-1pdq8kk"> </h3> <p class="svelte-1pdq8kk"> </p> <a href="#menu" class="svelte-1pdq8kk"> </a></div> <div class="hours-card svelte-1pdq8kk"><h3 class="svelte-1pdq8kk"><!> </h3> <div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk"><!> </span><strong class="svelte-1pdq8kk"> </strong></div> <div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk"><!> </span><strong class="svelte-1pdq8kk"> </strong></div> <div class="hours-row svelte-1pdq8kk"><span class="svelte-1pdq8kk"><!> </span><strong class="svelte-1pdq8kk"> </strong></div></div></div></div></section> <section class="wine-section testimonials-section svelte-1pdq8kk" id="testimonials"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="testimonial-grid svelte-1pdq8kk"></div></div></section> <section class="wine-section reservation-section svelte-1pdq8kk" id="reservation"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div> <p class="svelte-1pdq8kk"> </p></div> <div class="reservation-grid svelte-1pdq8kk"><div class="contact-panel svelte-1pdq8kk"><h3 class="svelte-1pdq8kk"> </h3> <p class="svelte-1pdq8kk"> </p> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div></div> <form class="source-form svelte-1pdq8kk"><label class="svelte-1pdq8kk"> <input type="text" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk"> <input type="tel" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk"> <input type="email" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk"> <select class="svelte-1pdq8kk"></select></label> <label class="svelte-1pdq8kk"> <input type="date" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk"> <select class="svelte-1pdq8kk"></select></label> <label class="full svelte-1pdq8kk"> <textarea rows="3" class="svelte-1pdq8kk"></textarea></label> <button type="submit" class="wine-button primary full svelte-1pdq8kk"><!> </button></form></div></div></section> <section class="wine-section blog-section svelte-1pdq8kk" id="blog"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div></div> <div class="blog-grid svelte-1pdq8kk"></div></div></section> <section class="newsletter svelte-1pdq8kk" id="newsletter"><div class="newsletter-bg svelte-1pdq8kk"></div> <div class="wine-container newsletter-inner svelte-1pdq8kk"><span class="script-label light svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <p class="svelte-1pdq8kk"> </p> <form class="svelte-1pdq8kk"><input type="email" aria-label="Email address" class="svelte-1pdq8kk"/> <button type="submit" class="svelte-1pdq8kk"><!> </button></form> <small class="svelte-1pdq8kk"><!> </small></div></section> <section class="wine-section contact-section svelte-1pdq8kk" id="contact-section"><div class="wine-container svelte-1pdq8kk"><div class="section-heading svelte-1pdq8kk"><span class="script-label svelte-1pdq8kk"> </span> <h2 class="svelte-1pdq8kk"> <span class="svelte-1pdq8kk"> </span></h2> <div class="section-line svelte-1pdq8kk"></div> <p class="svelte-1pdq8kk"> </p></div> <div class="reservation-grid svelte-1pdq8kk"><div class="contact-panel svelte-1pdq8kk"><h3 class="svelte-1pdq8kk"> </h3> <p class="svelte-1pdq8kk"> </p> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div> <div class="svelte-1pdq8kk"><!><span class="svelte-1pdq8kk"><strong class="svelte-1pdq8kk"> </strong> </span></div></div> <form class="source-form svelte-1pdq8kk"><label class="svelte-1pdq8kk"> <input type="text" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk"> <input type="email" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk"> <input type="tel" class="svelte-1pdq8kk"/></label> <label class="svelte-1pdq8kk"> <select class="svelte-1pdq8kk"></select></label> <label class="full svelte-1pdq8kk"> <textarea rows="5" class="svelte-1pdq8kk"></textarea></label> <button type="submit" class="wine-button primary svelte-1pdq8kk"><!> </button></form></div></div></section>`, 1);

export default function WineHomepage($$anchor, $$props) {
	$.push($$props, true);

	const pad = (value) => String(Math.floor(value)).padStart(2, '0');
	const countdown = $.derived(() => $$props.themeContent.special.countdown);
	const countdownDuration = $.derived(() => $$props.themeContent.special.countdown?.durationSeconds ?? 0);
	const reservationForm = $.derived(() => $$props.themeContent.reservation.form);
	const contactForm = $.derived(() => $$props.themeContent.contact.form);
	const seedSeconds = untrack(() => $$props.themeContent.special.countdown?.durationSeconds ?? 0);
	let cdH = $.state($.proxy(pad(seedSeconds / 3600)));
	let cdM = $.state($.proxy(pad(seedSeconds % 3600 / 60)));
	let cdS = $.state($.proxy(pad(seedSeconds % 60)));

	$.user_effect(() => {
		const end = Date.now() + $.get(countdownDuration) * 1000;

		const tick = setInterval(
			() => {
				const diff = Math.max(0, end - Date.now());

				$.set(cdH, pad(diff / 3600000), true);
				$.set(cdM, pad(diff % 3600000 / 60000), true);
				$.set(cdS, pad(diff % 60000 / 1000), true);

				if (diff === 0) clearInterval(tick);
			},
			1000
		);

		return () => clearInterval(tick);
	});

	var fragment = root_23();
	var section = $.first_child(fragment);
	var div = $.sibling($.child(section), 4);
	var text = $.only_child(div, true);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var span = $.child(div_3);
	var node = $.child(span);

	Star(node, { class: 'h-4 w-4' });
	$.reset(span);

	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(div_3);

	var h1 = $.sibling(div_3, 2);
	var text_2 = $.child(h1);
	var span_2 = $.sibling(text_2);
	var text_3 = $.only_child(span_2, true);
	var text_4 = $.sibling(span_2, 2, true);

	$.reset(h1);

	var p = $.sibling(h1, 2);
	var text_5 = $.only_child(p, true);
	var div_4 = $.sibling(p, 2);
	var a = $.child(div_4);
	var node_1 = $.child(a);

	Utensils(node_1, { class: 'h-4 w-4' });

	var text_6 = $.sibling(node_1);

	$.reset(a);

	var a_1 = $.sibling(a, 2);
	var span_3 = $.child(a_1);
	var node_2 = $.child(span_3);

	Play(node_2, { class: 'h-4 w-4 fill-current' });
	$.reset(span_3);

	var text_7 = $.sibling(span_3);

	$.reset(a_1);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);

	$.each(div_5, 21, () => $$props.themeContent.hero.stats, $.index, ($$anchor, stat, index) => {
		var fragment_1 = root_1();
		var div_6 = $.first_child(fragment_1);
		var strong = $.child(div_6);
		var text_8 = $.child(strong, true);
		var em = $.sibling(text_8);
		var text_9 = $.only_child(em, true);

		$.reset(strong);

		var span_4 = $.sibling(strong);
		var text_10 = $.only_child(span_4, true);

		$.reset(div_6);

		var node_3 = $.sibling(div_6, 2);

		{
			var consequent = ($$anchor) => {
				var i_1 = root();

				$.append($$anchor, i_1);
			};

			$.if(node_3, ($$render) => {
				if (index < $$props.themeContent.hero.stats.length - 1) $$render(consequent);
			});
		}

		$.template_effect(() => {
			$.set_text(text_8, $.get(stat).value);
			$.set_text(text_9, $.get(stat).suffix || '');
			$.set_text(text_10, $.get(stat).label);
		});

		$.append($$anchor, fragment_1);
	});

	$.reset(div_5);
	$.reset(div_2);

	var div_7 = $.sibling(div_2, 2);
	var div_8 = $.child(div_7);
	var img = $.only_child(div_8);
	var node_4 = $.sibling(div_8, 2);

	$.each(node_4, 17, () => $$props.themeContent.hero.floatingCards, $.index, ($$anchor, card, index) => {
		var div_9 = root_2();

		$.set_class(div_9, 1, `floating-card fc${index + 1}`, 'svelte-1pdq8kk');

		var span_5 = $.child(div_9);
		var node_5 = $.child(span_5);

		{
			var consequent_1 = ($$anchor) => {
				Flame($$anchor, { class: 'h-4 w-4' });
			};

			var consequent_2 = ($$anchor) => {
				Star($$anchor, { class: 'h-4 w-4 fill-current' });
			};

			var alternate = ($$anchor) => {
				Clock($$anchor, { class: 'h-4 w-4' });
			};

			$.if(node_5, ($$render) => {
				if ($.get(card).icon === 'flame') $$render(consequent_1); else if ($.get(card).icon === 'star') $$render(consequent_2, 1); else $$render(alternate, -1);
			});
		}

		$.reset(span_5);

		var div_10 = $.sibling(span_5, 2);
		var strong_1 = $.child(div_10);
		var text_11 = $.only_child(strong_1, true);
		var span_6 = $.sibling(strong_1);
		var text_12 = $.only_child(span_6, true);

		$.reset(div_10);
		$.reset(div_9);

		$.template_effect(() => {
			$.set_class(span_5, 1, `floating-icon ${$.get(card).tone ?? ''}`, 'svelte-1pdq8kk');
			$.set_text(text_11, $.get(card).title);
			$.set_text(text_12, $.get(card).text);
		});

		$.append($$anchor, div_9);
	});

	$.reset(div_7);
	$.reset(div_1);
	$.reset(section);

	var div_11 = $.sibling(section, 2);
	var div_12 = $.child(div_11);

	$.each(div_12, 20, () => Array(2), $.index, ($$anchor, _) => {
		var fragment_5 = $.comment();
		var node_6 = $.first_child(fragment_5);

		$.each(node_6, 17, () => $$props.themeContent.ticker, $.index, ($$anchor, item) => {
			var span_7 = root_3();
			var node_7 = $.child(span_7);

			Circle(node_7, { class: 'h-2 w-2 fill-current' });

			var text_13 = $.sibling(node_7, 1, true);

			$.reset(span_7);
			$.template_effect(() => $.set_text(text_13, $.get(item)));
			$.append($$anchor, span_7);
		});

		$.append($$anchor, fragment_5);
	});

	$.reset(div_12);
	$.reset(div_11);

	var section_1 = $.sibling(div_11, 2);
	var div_13 = $.child(section_1);
	var div_14 = $.child(div_13);
	var span_8 = $.child(div_14);
	var text_14 = $.only_child(span_8, true);
	var h2 = $.sibling(span_8, 2);
	var text_15 = $.child(h2);
	var span_9 = $.sibling(text_15);
	var text_16 = $.only_child(span_9, true);

	$.reset(h2);

	var p_1 = $.sibling(h2, 4);
	var text_17 = $.only_child(p_1, true);

	$.reset(div_14);

	var node_8 = $.sibling(div_14, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_15 = root_4();

			$.each(div_15, 20, () => Array(6), $.index, ($$anchor, _) => {
				Skeleton($$anchor, { class: 'aspect-square w-full' });
			});

			$.reset(div_15);
			$.append($$anchor, div_15);
		};

		var consequent_5 = ($$anchor) => {
			var div_16 = root_4();

			$.each(div_16, 21, () => $$props.featuredCategories.slice(0, 6), $.index, ($$anchor, cat) => {
				var a_2 = root_6();
				var node_9 = $.child(a_2);

				{
					var consequent_4 = ($$anchor) => {
						var img_1 = root_5();

						$.template_effect(
							($0) => {
								$.set_attribute(img_1, 'src', $0);
								$.set_attribute(img_1, 'alt', $.get(cat).name);
							},
							[
								() => themeImage($.get(cat).image || $.get(cat).img, $.get(cat).name)
							]
						);

						$.append($$anchor, img_1);
					};

					$.if(node_9, ($$render) => {
						if ($.get(cat).image || $.get(cat).img) $$render(consequent_4);
					});
				}

				var strong_2 = $.sibling(node_9, 2);
				var text_18 = $.only_child(strong_2, true);
				var span_10 = $.sibling(strong_2, 2);
				var text_19 = $.only_child(span_10, true);

				$.reset(a_2);

				$.template_effect(() => {
					$.set_attribute(a_2, 'href', `/${($.get(cat).slug || $.get(cat)._id) ?? ''}`);
					$.set_text(text_18, $.get(cat).name);
					$.set_text(text_19, $$props.themeContent.category.cardCta);
				});

				$.append($$anchor, a_2);
			});

			$.reset(div_16);
			$.append($$anchor, div_16);
		};

		var alternate_1 = ($$anchor) => {
			var div_17 = root_7();
			var strong_3 = $.child(div_17);
			var text_20 = $.only_child(strong_3, true);
			var span_11 = $.sibling(strong_3, 2);
			var text_21 = $.only_child(span_11, true);

			$.reset(div_17);

			$.template_effect(() => {
				$.set_text(text_20, $$props.themeContent.category.emptyTitle);
				$.set_text(text_21, $$props.themeContent.category.emptyText);
			});

			$.append($$anchor, div_17);
		};

		$.if(node_8, ($$render) => {
			if ($$props.homepageModule.loading) $$render(consequent_3); else if ($$props.featuredCategories.length > 0) $$render(consequent_5, 1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_13);
	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var div_18 = $.child(section_2);
	var div_19 = $.child(div_18);
	var div_20 = $.child(div_19);
	var img_2 = $.only_child(div_20);
	var img_3 = $.sibling(div_20, 2);
	var div_21 = $.sibling(img_3, 2);
	var strong_4 = $.child(div_21);
	var text_22 = $.only_child(strong_4, true);
	var span_12 = $.sibling(strong_4);
	var text_23 = $.only_child(span_12, true);

	$.reset(div_21);
	$.reset(div_19);

	var div_22 = $.sibling(div_19, 2);
	var span_13 = $.child(div_22);
	var text_24 = $.only_child(span_13, true);
	var h2_1 = $.sibling(span_13, 2);
	var text_25 = $.child(h2_1, true);
	var span_14 = $.sibling(text_25, 2);
	var text_26 = $.only_child(span_14, true);

	$.reset(h2_1);

	var p_2 = $.sibling(h2_1, 4);
	var text_27 = $.only_child(p_2, true);
	var div_23 = $.sibling(p_2, 2);

	$.each(div_23, 21, () => $$props.themeContent.about.features, $.index, ($$anchor, feature) => {
		var div_24 = root_8();
		var span_15 = $.child(div_24);
		var node_10 = $.child(span_15);

		{
			var consequent_6 = ($$anchor) => {
				Leaf($$anchor, { class: 'h-5 w-5' });
			};

			var consequent_7 = ($$anchor) => {
				Award($$anchor, { class: 'h-5 w-5' });
			};

			var alternate_2 = ($$anchor) => {
				Zap($$anchor, { class: 'h-5 w-5' });
			};

			$.if(node_10, ($$render) => {
				if ($.get(feature).icon === 'leaf') $$render(consequent_6); else if ($.get(feature).icon === 'award') $$render(consequent_7, 1); else $$render(alternate_2, -1);
			});
		}

		$.reset(span_15);

		var p_3 = $.sibling(span_15, 2);
		var strong_5 = $.child(p_3);
		var text_28 = $.only_child(strong_5, true);
		var span_16 = $.sibling(strong_5);
		var text_29 = $.only_child(span_16, true);

		$.reset(p_3);
		$.reset(div_24);

		$.template_effect(() => {
			$.set_class(span_15, 1, `feature-icon ${$.get(feature).tone ?? ''}`, 'svelte-1pdq8kk');
			$.set_text(text_28, $.get(feature).title);
			$.set_text(text_29, $.get(feature).text);
		});

		$.append($$anchor, div_24);
	});

	$.reset(div_23);

	var a_3 = $.sibling(div_23, 2);
	var node_11 = $.child(a_3);

	BookOpen(node_11, { class: 'h-4 w-4' });

	var text_30 = $.sibling(node_11);

	$.reset(a_3);
	$.reset(div_22);
	$.reset(div_18);
	$.reset(section_2);

	var section_3 = $.sibling(section_2, 2);
	var div_25 = $.child(section_3);
	var div_26 = $.child(div_25);
	var span_17 = $.child(div_26);
	var text_31 = $.only_child(span_17, true);
	var h2_2 = $.sibling(span_17, 2);
	var text_32 = $.child(h2_2);
	var span_18 = $.sibling(text_32);
	var text_33 = $.only_child(span_18, true);

	$.reset(h2_2);
	$.next(2);
	$.reset(div_26);

	var div_27 = $.sibling(div_26, 2);

	$.each(div_27, 21, () => $$props.filterButtons, $.index, ($$anchor, filter, i) => {
		var button = root_9();

		$.set_class(button, 1, 'svelte-1pdq8kk', null, {}, { active: i === 0 });

		var text_34 = $.only_child(button, true);

		$.template_effect(() => $.set_text(text_34, $.get(filter)));
		$.append($$anchor, button);
	});

	$.reset(div_27);

	var node_12 = $.sibling(div_27, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_28 = root_11();

			$.each(div_28, 20, () => Array(8), $.index, ($$anchor, _) => {
				var div_29 = root_10();
				var node_13 = $.child(div_29);

				Skeleton(node_13, { class: 'aspect-square w-full' });

				var div_30 = $.sibling(node_13, 2);
				var node_14 = $.child(div_30);

				Skeleton(node_14, { class: 'h-4 w-3/4' });

				var node_15 = $.sibling(node_14);

				Skeleton(node_15, { class: 'h-4 w-1/2' });
				$.reset(div_30);
				$.reset(div_29);
				$.append($$anchor, div_29);
			});

			$.reset(div_28);
			$.append($$anchor, div_28);
		};

		var consequent_11 = ($$anchor) => {
			var div_31 = root_11();

			$.each(div_31, 21, () => $$props.featuredProducts.slice(0, 6), $.index, ($$anchor, product) => {
				var a_4 = root_14();
				var div_32 = $.child(a_4);
				var img_4 = $.child(div_32);
				var node_16 = $.sibling(img_4, 2);

				{
					var consequent_9 = ($$anchor) => {
						var em_1 = root_12();
						var text_35 = $.only_child(em_1);

						$.template_effect(($0) => $.set_text(text_35, `${$0 ?? ''}${$$props.themeContent.menu.discountSuffix ?? ''}`), [
							() => Math.round(($.get(product).mrp - $.get(product).price) / $.get(product).mrp * 100)
						]);

						$.append($$anchor, em_1);
					};

					$.if(node_16, ($$render) => {
						if ($.get(product).mrp && $.get(product).price && $.get(product).mrp > $.get(product).price) $$render(consequent_9);
					});
				}

				var span_19 = $.sibling(node_16, 2);
				var node_17 = $.child(span_19);

				Heart(node_17, { class: 'h-4 w-4' });
				$.reset(span_19);
				$.reset(div_32);

				var div_33 = $.sibling(div_32, 2);
				var p_4 = $.child(div_33);
				var text_36 = $.only_child(p_4, true);
				var h3 = $.sibling(p_4, 2);
				var text_37 = $.only_child(h3, true);
				var span_20 = $.sibling(h3, 2);
				var text_38 = $.only_child(span_20, true);
				var div_34 = $.sibling(span_20, 2);
				var strong_6 = $.child(div_34);
				var text_39 = $.only_child(strong_6, true);
				var node_18 = $.sibling(strong_6, 2);

				{
					var consequent_10 = ($$anchor) => {
						var small = root_13();
						var node_19 = $.child(small);

						Star(node_19, { class: 'h-3 w-3 fill-current' });

						var text_40 = $.sibling(node_19);

						$.reset(small);
						$.template_effect(() => $.set_text(text_40, ` (${$.get(product).rating ?? ''})`));
						$.append($$anchor, small);
					};

					$.if(node_18, ($$render) => {
						if ($.get(product).rating) $$render(consequent_10);
					});
				}

				var b = $.sibling(node_18, 2);
				var node_20 = $.child(b);

				Plus(node_20, { class: 'h-4 w-4' });
				$.reset(b);
				$.reset(div_34);
				$.reset(div_33);
				$.reset(a_4);

				$.template_effect(
					($0) => {
						$.set_attribute(a_4, 'href', `/products/${$.get(product).slug ?? ''}`);
						$.set_style(div_32, `aspect-ratio:${$$props.aspectWidth ?? ''}/${$$props.aspectHeight ?? ''};`);
						$.set_attribute(img_4, 'src', $.get(product).image || $.get(product).img || $.get(product).thumbnail);
						$.set_attribute(img_4, 'alt', $.get(product).name || $.get(product).title);
						$.set_text(text_36, $.get(product).category?.name || $$props.themeContent.menu.categoryFallback);
						$.set_text(text_37, $.get(product).name || $.get(product).title);
						$.set_text(text_38, $$props.themeContent.menu.cardDescription);
						$.set_text(text_39, $0);
					},
					[
						() => formatPrice($.get(product).price, $$props.currencyCode || '')
					]
				);

				$.append($$anchor, a_4);
			});

			$.reset(div_31);
			$.append($$anchor, div_31);
		};

		var alternate_3 = ($$anchor) => {
			var div_35 = root_7();
			var strong_7 = $.child(div_35);
			var text_41 = $.only_child(strong_7, true);
			var span_21 = $.sibling(strong_7, 2);
			var text_42 = $.only_child(span_21, true);

			$.reset(div_35);

			$.template_effect(() => {
				$.set_text(text_41, $$props.themeContent.menu.emptyTitle);
				$.set_text(text_42, $$props.themeContent.menu.emptyText);
			});

			$.append($$anchor, div_35);
		};

		$.if(node_12, ($$render) => {
			if ($$props.homepageModule.loadingFeaturedProducts) $$render(consequent_8); else if ($$props.featuredProducts.length > 0) $$render(consequent_11, 1); else $$render(alternate_3, -1);
		});
	}

	var div_36 = $.sibling(node_12, 2);
	var a_5 = $.child(div_36);
	var node_21 = $.child(a_5);

	Utensils(node_21, { class: 'h-4 w-4' });

	var text_43 = $.sibling(node_21);

	$.reset(a_5);
	$.reset(div_36);
	$.reset(div_25);
	$.reset(section_3);

	var section_4 = $.sibling(section_3, 2);
	var div_37 = $.sibling($.child(section_4), 2);
	var div_38 = $.child(div_37);
	var span_22 = $.child(div_38);
	var text_44 = $.only_child(span_22, true);
	var h2_3 = $.sibling(span_22, 2);
	var text_45 = $.child(h2_3);
	var span_23 = $.sibling(text_45);
	var text_46 = $.only_child(span_23, true);

	$.reset(h2_3);

	var p_5 = $.sibling(h2_3, 2);
	var text_47 = $.only_child(p_5, true);
	var div_39 = $.sibling(p_5, 2);
	var div_40 = $.child(div_39);
	var strong_8 = $.child(div_40);
	var text_48 = $.only_child(strong_8, true);
	var span_24 = $.sibling(strong_8);
	var text_49 = $.only_child(span_24, true);

	$.reset(div_40);

	var div_41 = $.sibling(div_40, 2);
	var strong_9 = $.child(div_41);
	var text_50 = $.only_child(strong_9, true);
	var span_25 = $.sibling(strong_9);
	var text_51 = $.only_child(span_25, true);

	$.reset(div_41);

	var div_42 = $.sibling(div_41, 2);
	var strong_10 = $.child(div_42);
	var text_52 = $.only_child(strong_10, true);
	var span_26 = $.sibling(strong_10);
	var text_53 = $.only_child(span_26, true);

	$.reset(div_42);
	$.reset(div_39);

	var a_6 = $.sibling(div_39, 2);
	var node_22 = $.child(a_6);

	ShoppingCart(node_22, { class: 'h-4 w-4' });

	var text_54 = $.sibling(node_22);

	$.reset(a_6);
	$.reset(div_38);

	var div_43 = $.sibling(div_38, 2);
	var img_5 = $.sibling($.child(div_43), 2);
	var div_44 = $.sibling(img_5, 2);
	var span_27 = $.child(div_44);
	var text_55 = $.only_child(span_27, true);
	var strong_11 = $.sibling(span_27);
	var text_56 = $.only_child(strong_11, true);

	$.reset(div_44);
	$.reset(div_43);
	$.reset(div_37);
	$.reset(section_4);

	var section_5 = $.sibling(section_4, 2);
	var div_45 = $.child(section_5);
	var div_46 = $.child(div_45);
	var span_28 = $.child(div_46);
	var text_57 = $.only_child(span_28, true);
	var h2_4 = $.sibling(span_28, 2);
	var text_58 = $.child(h2_4);
	var span_29 = $.sibling(text_58);
	var text_59 = $.only_child(span_29, true);

	$.reset(h2_4);
	$.next(2);
	$.reset(div_46);

	var div_47 = $.sibling(div_46, 2);

	$.each(div_47, 21, () => $$props.themeContent.gallery.items, $.index, ($$anchor, item) => {
		var a_7 = root_15();
		var img_6 = $.child(a_7);
		var span_30 = $.sibling(img_6, 2);
		var node_23 = $.child(span_30);

		Search(node_23, { class: 'h-4 w-4' });

		var text_60 = $.sibling(node_23);

		$.reset(span_30);
		$.reset(a_7);

		$.template_effect(
			($0) => {
				$.set_attribute(img_6, 'src', $0);
				$.set_attribute(img_6, 'alt', $.get(item).title);
				$.set_text(text_60, ` ${$.get(item).title ?? ''}`);
			},
			[() => themeImage($.get(item).image, $.get(item).title)]
		);

		$.append($$anchor, a_7);
	});

	$.reset(div_47);
	$.reset(div_45);
	$.reset(section_5);

	var section_6 = $.sibling(section_5, 2);
	var div_48 = $.child(section_6);
	var div_49 = $.child(div_48);
	var span_31 = $.child(div_49);
	var text_61 = $.only_child(span_31, true);
	var h2_5 = $.sibling(span_31, 2);
	var text_62 = $.child(h2_5);
	var span_32 = $.sibling(text_62);
	var text_63 = $.only_child(span_32, true);

	$.reset(h2_5);
	$.next(2);
	$.reset(div_49);

	var div_50 = $.sibling(div_49, 2);

	$.each(div_50, 21, () => $$props.themeContent.history.items, $.index, ($$anchor, item) => {
		var div_51 = root_16();
		var div_52 = $.child(div_51);
		var strong_12 = $.child(div_52);
		var text_64 = $.only_child(strong_12, true);

		$.reset(div_52);

		var div_53 = $.sibling(div_52, 4);
		var h3_1 = $.child(div_53);
		var text_65 = $.only_child(h3_1, true);
		var p_6 = $.sibling(h3_1);
		var text_66 = $.only_child(p_6, true);

		$.reset(div_53);
		$.reset(div_51);

		$.template_effect(() => {
			$.set_text(text_64, $.get(item)[0]);
			$.set_text(text_65, $.get(item)[1]);
			$.set_text(text_66, $.get(item)[2]);
		});

		$.append($$anchor, div_51);
	});

	$.reset(div_50);
	$.reset(div_48);
	$.reset(section_6);

	var section_7 = $.sibling(section_6, 2);
	var div_54 = $.child(section_7);
	var div_55 = $.child(div_54);
	var span_33 = $.child(div_55);
	var text_67 = $.only_child(span_33, true);
	var h2_6 = $.sibling(span_33, 2);
	var text_68 = $.child(h2_6);
	var span_34 = $.sibling(text_68);
	var text_69 = $.only_child(span_34, true);

	$.reset(h2_6);
	$.next(2);
	$.reset(div_55);

	var div_56 = $.sibling(div_55, 2);

	$.each(div_56, 21, () => $$props.themeContent.chefs.items, $.index, ($$anchor, chef) => {
		var div_57 = root_17();
		var img_7 = $.child(div_57);
		var div_58 = $.sibling(img_7, 2);
		var h3_2 = $.child(div_58);
		var text_70 = $.only_child(h3_2, true);
		var span_35 = $.sibling(h3_2, 2);
		var text_71 = $.only_child(span_35, true);

		$.reset(div_58);
		$.reset(div_57);

		$.template_effect(
			($0) => {
				$.set_attribute(img_7, 'src', $0);
				$.set_attribute(img_7, 'alt', $.get(chef).name);
				$.set_text(text_70, $.get(chef).name);
				$.set_text(text_71, $.get(chef).role);
			},
			[() => themeImage($.get(chef).image, $.get(chef).name)]
		);

		$.append($$anchor, div_57);
	});

	$.reset(div_56);
	$.reset(div_54);
	$.reset(section_7);

	var section_8 = $.sibling(section_7, 2);
	var div_59 = $.sibling($.child(section_8), 2);
	var div_60 = $.child(div_59);
	var span_36 = $.child(div_60);
	var text_72 = $.only_child(span_36, true);
	var h2_7 = $.sibling(span_36, 2);
	var text_73 = $.child(h2_7);
	var span_37 = $.sibling(text_73);
	var text_74 = $.only_child(span_37, true);

	$.reset(h2_7);
	$.next(2);
	$.reset(div_60);

	var div_61 = $.sibling(div_60, 2);
	var div_62 = $.child(div_61);

	$.each(div_62, 21, () => $$props.themeContent.hours.rows, $.index, ($$anchor, row) => {
		var div_63 = root_18();
		var span_38 = $.child(div_63);
		var node_24 = $.child(span_38);

		CalendarCheck(node_24, { class: 'h-4 w-4' });

		var text_75 = $.sibling(node_24, 1, true);

		$.reset(span_38);

		var strong_13 = $.sibling(span_38, 2);
		let classes;
		var i_2 = $.child(strong_13);
		let classes_1;
		var text_76 = $.sibling(i_2, 1, true);

		$.reset(strong_13);
		$.reset(div_63);

		$.template_effect(() => {
			$.set_text(text_75, $.get(row)[0]);
			classes = $.set_class(strong_13, 1, 'svelte-1pdq8kk', null, classes, { closed: !$.get(row)[2] });
			classes_1 = $.set_class(i_2, 1, 'svelte-1pdq8kk', null, classes_1, { open: $.get(row)[2] });
			$.set_text(text_76, $.get(row)[1]);
		});

		$.append($$anchor, div_63);
	});

	$.reset(div_62);

	var div_64 = $.sibling(div_62, 2);
	var node_25 = $.child(div_64);

	Truck(node_25, { class: 'h-10 w-10' });

	var h3_3 = $.sibling(node_25, 2);
	var text_77 = $.only_child(h3_3, true);
	var p_7 = $.sibling(h3_3, 2);
	var text_78 = $.only_child(p_7, true);
	var a_8 = $.sibling(p_7, 2);
	var text_79 = $.only_child(a_8, true);

	$.reset(div_64);

	var div_65 = $.sibling(div_64, 2);
	var h3_4 = $.child(div_65);
	var node_26 = $.child(h3_4);

	MapPin(node_26, { class: 'h-4 w-4' });

	var text_80 = $.sibling(node_26, 1, true);

	$.reset(h3_4);

	var div_66 = $.sibling(h3_4, 2);
	var span_39 = $.child(div_66);
	var node_27 = $.child(span_39);

	MapPin(node_27, { class: 'h-4 w-4' });

	var text_81 = $.sibling(node_27, 1, true);

	$.reset(span_39);

	var strong_14 = $.sibling(span_39);
	var text_82 = $.only_child(strong_14, true);

	$.reset(div_66);

	var div_67 = $.sibling(div_66, 2);
	var span_40 = $.child(div_67);
	var node_28 = $.child(span_40);

	Phone(node_28, { class: 'h-4 w-4' });

	var text_83 = $.sibling(node_28, 1, true);

	$.reset(span_40);

	var strong_15 = $.sibling(span_40);
	var text_84 = $.only_child(strong_15, true);

	$.reset(div_67);

	var div_68 = $.sibling(div_67, 2);
	var span_41 = $.child(div_68);
	var node_29 = $.child(span_41);

	Mail(node_29, { class: 'h-4 w-4' });

	var text_85 = $.sibling(node_29, 1, true);

	$.reset(span_41);

	var strong_16 = $.sibling(span_41);
	var text_86 = $.only_child(strong_16, true);

	$.reset(div_68);
	$.reset(div_65);
	$.reset(div_61);
	$.reset(div_59);
	$.reset(section_8);

	var section_9 = $.sibling(section_8, 2);
	var div_69 = $.child(section_9);
	var div_70 = $.child(div_69);
	var span_42 = $.child(div_70);
	var text_87 = $.only_child(span_42, true);
	var h2_8 = $.sibling(span_42, 2);
	var text_88 = $.child(h2_8);
	var span_43 = $.sibling(text_88);
	var text_89 = $.only_child(span_43, true);

	$.reset(h2_8);
	$.next(2);
	$.reset(div_70);

	var div_71 = $.sibling(div_70, 2);

	$.each(div_71, 21, () => $$props.themeContent.testimonials.items, $.index, ($$anchor, testimonial) => {
		var div_72 = root_19();
		var node_30 = $.child(div_72);

		Quote(node_30, { class: 'quote-icon' });

		var div_73 = $.sibling(node_30, 2);
		var node_31 = $.child(div_73);

		Star(node_31, { class: 'h-4 w-4 fill-current' });

		var node_32 = $.sibling(node_31);

		Star(node_32, { class: 'h-4 w-4 fill-current' });

		var node_33 = $.sibling(node_32);

		Star(node_33, { class: 'h-4 w-4 fill-current' });

		var node_34 = $.sibling(node_33);

		Star(node_34, { class: 'h-4 w-4 fill-current' });

		var node_35 = $.sibling(node_34);

		Star(node_35, { class: 'h-4 w-4 fill-current' });
		$.reset(div_73);

		var p_8 = $.sibling(div_73, 2);
		var text_90 = $.only_child(p_8, true);
		var div_74 = $.sibling(p_8, 2);
		var img_8 = $.child(div_74);
		var div_75 = $.sibling(img_8, 2);
		var strong_17 = $.child(div_75);
		var text_91 = $.only_child(strong_17, true);
		var span_44 = $.sibling(strong_17);
		var text_92 = $.only_child(span_44, true);

		$.reset(div_75);
		$.reset(div_74);
		$.reset(div_72);

		$.template_effect(
			($0) => {
				$.set_text(text_90, $.get(testimonial).text);
				$.set_attribute(img_8, 'src', $0);
				$.set_attribute(img_8, 'alt', $.get(testimonial).name);
				$.set_text(text_91, $.get(testimonial).name);
				$.set_text(text_92, $.get(testimonial).role);
			},
			[
				() => themeImage($.get(testimonial).image, $.get(testimonial).name)
			]
		);

		$.append($$anchor, div_72);
	});

	$.reset(div_71);
	$.reset(div_69);
	$.reset(section_9);

	var section_10 = $.sibling(section_9, 2);
	var div_76 = $.child(section_10);
	var div_77 = $.child(div_76);
	var span_45 = $.child(div_77);
	var text_93 = $.only_child(span_45, true);
	var h2_9 = $.sibling(span_45, 2);
	var text_94 = $.child(h2_9);
	var span_46 = $.sibling(text_94);
	var text_95 = $.only_child(span_46, true);

	$.reset(h2_9);

	var p_9 = $.sibling(h2_9, 4);
	var text_96 = $.only_child(p_9, true);

	$.reset(div_77);

	var div_78 = $.sibling(div_77, 2);
	var div_79 = $.child(div_78);
	var h3_5 = $.child(div_79);
	var text_97 = $.only_child(h3_5, true);
	var p_10 = $.sibling(h3_5, 2);
	var text_98 = $.only_child(p_10, true);
	var div_80 = $.sibling(p_10, 2);
	var node_36 = $.child(div_80);

	Clock(node_36, { class: 'h-5 w-5' });

	var span_47 = $.sibling(node_36);
	var strong_18 = $.child(span_47);
	var text_99 = $.only_child(strong_18, true);
	var text_100 = $.sibling(strong_18, 1, true);

	$.reset(span_47);
	$.reset(div_80);

	var div_81 = $.sibling(div_80, 2);
	var node_37 = $.child(div_81);

	Phone(node_37, { class: 'h-5 w-5' });

	var span_48 = $.sibling(node_37);
	var strong_19 = $.child(span_48);
	var text_101 = $.only_child(strong_19, true);
	var text_102 = $.sibling(strong_19, 1, true);

	$.reset(span_48);
	$.reset(div_81);

	var div_82 = $.sibling(div_81, 2);
	var node_38 = $.child(div_82);

	Users(node_38, { class: 'h-5 w-5' });

	var span_49 = $.sibling(node_38);
	var strong_20 = $.child(span_49);
	var text_103 = $.only_child(strong_20, true);
	var text_104 = $.sibling(strong_20, 1, true);

	$.reset(span_49);
	$.reset(div_82);

	var div_83 = $.sibling(div_82, 2);
	var node_39 = $.child(div_83);

	MapPin(node_39, { class: 'h-5 w-5' });

	var span_50 = $.sibling(node_39);
	var strong_21 = $.child(span_50);
	var text_105 = $.only_child(strong_21, true);
	var text_106 = $.sibling(strong_21, 1, true);

	$.reset(span_50);
	$.reset(div_83);
	$.reset(div_79);

	var form = $.sibling(div_79, 2);
	var label = $.child(form);
	var text_107 = $.child(label, true);
	var input = $.sibling(text_107);

	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var text_108 = $.child(label_1, true);
	var input_1 = $.sibling(text_108);

	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var text_109 = $.child(label_2, true);
	var input_2 = $.sibling(text_109);

	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var text_110 = $.child(label_3, true);
	var select = $.sibling(text_110);

	$.each(select, 21, () => $.get(reservationForm)?.guestsOptions ?? [], $.index, ($$anchor, guests) => {
		var option = root_20();
		var text_111 = $.only_child(option, true);
		var option_value = {};

		$.template_effect(() => {
			$.set_text(text_111, $.get(guests));

			if (option_value !== (option_value = $.get(guests))) {
				option.__value = option_value;
			}
		});

		$.append($$anchor, option);
	});

	$.reset(select);
	$.reset(label_3);

	var label_4 = $.sibling(label_3, 2);
	var text_112 = $.child(label_4, true);

	$.next();
	$.reset(label_4);

	var label_5 = $.sibling(label_4, 2);
	var text_113 = $.child(label_5, true);
	var select_1 = $.sibling(text_113);

	$.each(select_1, 21, () => $.get(reservationForm)?.timeOptions ?? [], $.index, ($$anchor, time) => {
		var option_1 = root_20();
		var text_114 = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text_114, $.get(time));

			if (option_1_value !== (option_1_value = $.get(time))) {
				option_1.__value = option_1_value;
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select_1);
	$.reset(label_5);

	var label_6 = $.sibling(label_5, 2);
	var text_115 = $.child(label_6, true);
	var textarea = $.sibling(text_115);

	$.reset(label_6);

	var button_1 = $.sibling(label_6, 2);
	var node_40 = $.child(button_1);

	CalendarCheck(node_40, { class: 'h-4 w-4' });

	var text_116 = $.sibling(node_40, 1, true);

	$.reset(button_1);
	$.reset(form);
	$.reset(div_78);
	$.reset(div_76);
	$.reset(section_10);

	var section_11 = $.sibling(section_10, 2);
	var div_84 = $.child(section_11);
	var div_85 = $.child(div_84);
	var span_51 = $.child(div_85);
	var text_117 = $.only_child(span_51, true);
	var h2_10 = $.sibling(span_51, 2);
	var text_118 = $.child(h2_10);
	var span_52 = $.sibling(text_118);
	var text_119 = $.only_child(span_52, true);

	$.reset(h2_10);
	$.next(2);
	$.reset(div_85);

	var div_86 = $.sibling(div_85, 2);

	$.each(div_86, 21, () => $$props.themeContent.blog.items, $.index, ($$anchor, blog) => {
		var article = root_22();
		var div_87 = $.child(article);
		var img_9 = $.child(div_87);
		var div_88 = $.sibling(img_9, 2);
		var strong_22 = $.child(div_88);
		var text_120 = $.only_child(strong_22, true);
		var span_53 = $.sibling(strong_22);
		var text_121 = $.only_child(span_53, true);

		$.reset(div_88);
		$.reset(div_87);

		var div_89 = $.sibling(div_87, 2);
		var span_54 = $.child(div_89);
		var text_122 = $.only_child(span_54, true);
		var h3_6 = $.sibling(span_54, 2);
		var a_9 = $.child(h3_6);
		var text_123 = $.only_child(a_9, true);

		$.reset(h3_6);

		var node_41 = $.sibling(h3_6, 2);

		{
			var consequent_14 = ($$anchor) => {
				var p_11 = root_21();
				var node_42 = $.child(p_11);

				{
					var consequent_12 = ($$anchor) => {
						var span_55 = root_3();
						var node_43 = $.child(span_55);

						ChefHat(node_43, { class: 'h-3 w-3' });

						var text_124 = $.sibling(node_43, 1, true);

						$.reset(span_55);
						$.template_effect(() => $.set_text(text_124, $.get(blog).author));
						$.append($$anchor, span_55);
					};

					$.if(node_42, ($$render) => {
						if ($.get(blog).author) $$render(consequent_12);
					});
				}

				var node_44 = $.sibling(node_42, 2);

				{
					var consequent_13 = ($$anchor) => {
						var span_56 = root_3();
						var node_45 = $.child(span_56);

						Mail(node_45, { class: 'h-3 w-3' });

						var text_125 = $.sibling(node_45, 1, true);

						$.reset(span_56);
						$.template_effect(() => $.set_text(text_125, $.get(blog).comments));
						$.append($$anchor, span_56);
					};

					$.if(node_44, ($$render) => {
						if ($.get(blog).comments) $$render(consequent_13);
					});
				}

				$.reset(p_11);
				$.append($$anchor, p_11);
			};

			$.if(node_41, ($$render) => {
				if ($.get(blog).author || $.get(blog).comments) $$render(consequent_14);
			});
		}

		var a_10 = $.sibling(node_41, 2);
		var text_126 = $.child(a_10);
		var node_46 = $.sibling(text_126);

		ArrowRight(node_46, { class: 'h-4 w-4' });
		$.reset(a_10);
		$.reset(div_89);
		$.reset(article);

		$.template_effect(
			($0) => {
				$.set_attribute(img_9, 'src', $0);
				$.set_attribute(img_9, 'alt', $.get(blog).title);
				$.set_text(text_120, $.get(blog).date);
				$.set_text(text_121, $.get(blog).month);
				$.set_text(text_122, $.get(blog).tag);
				$.set_text(text_123, $.get(blog).title);
				$.set_text(text_126, `${$$props.themeContent.blog.readMore ?? ''} `);
			},
			[() => themeImage($.get(blog).image, $.get(blog).title)]
		);

		$.append($$anchor, article);
	});

	$.reset(div_86);
	$.reset(div_84);
	$.reset(section_11);

	var section_12 = $.sibling(section_11, 2);
	var div_90 = $.sibling($.child(section_12), 2);
	var span_57 = $.child(div_90);
	var text_127 = $.only_child(span_57, true);
	var h2_11 = $.sibling(span_57, 2);
	var text_128 = $.child(h2_11);
	var span_58 = $.sibling(text_128);
	var text_129 = $.only_child(span_58, true);

	$.reset(h2_11);

	var p_12 = $.sibling(h2_11, 2);
	var text_130 = $.only_child(p_12, true);
	var form_1 = $.sibling(p_12, 2);
	var input_3 = $.child(form_1);
	var button_2 = $.sibling(input_3, 2);
	var node_47 = $.child(button_2);

	Send(node_47, { class: 'h-4 w-4' });

	var text_131 = $.sibling(node_47);

	$.reset(button_2);
	$.reset(form_1);

	var small_1 = $.sibling(form_1, 2);
	var node_48 = $.child(small_1);

	Lock(node_48, { class: 'h-3 w-3' });

	var text_132 = $.sibling(node_48, 1, true);

	$.reset(small_1);
	$.reset(div_90);
	$.reset(section_12);

	var section_13 = $.sibling(section_12, 2);
	var div_91 = $.child(section_13);
	var div_92 = $.child(div_91);
	var span_59 = $.child(div_92);
	var text_133 = $.only_child(span_59, true);
	var h2_12 = $.sibling(span_59, 2);
	var text_134 = $.child(h2_12);
	var span_60 = $.sibling(text_134);
	var text_135 = $.only_child(span_60, true);

	$.reset(h2_12);

	var p_13 = $.sibling(h2_12, 4);
	var text_136 = $.only_child(p_13, true);

	$.reset(div_92);

	var div_93 = $.sibling(div_92, 2);
	var div_94 = $.child(div_93);
	var h3_7 = $.child(div_94);
	var text_137 = $.only_child(h3_7, true);
	var p_14 = $.sibling(h3_7, 2);
	var text_138 = $.only_child(p_14, true);
	var div_95 = $.sibling(p_14, 2);
	var node_49 = $.child(div_95);

	MapPin(node_49, { class: 'h-5 w-5' });

	var span_61 = $.sibling(node_49);
	var strong_23 = $.child(span_61);
	var text_139 = $.only_child(strong_23, true);
	var text_140 = $.sibling(strong_23, 1, true);

	$.reset(span_61);
	$.reset(div_95);

	var div_96 = $.sibling(div_95, 2);
	var node_50 = $.child(div_96);

	Phone(node_50, { class: 'h-5 w-5' });

	var span_62 = $.sibling(node_50);
	var strong_24 = $.child(span_62);
	var text_141 = $.only_child(strong_24, true);
	var text_142 = $.sibling(strong_24, 1, true);

	$.reset(span_62);
	$.reset(div_96);

	var div_97 = $.sibling(div_96, 2);
	var node_51 = $.child(div_97);

	Mail(node_51, { class: 'h-5 w-5' });

	var span_63 = $.sibling(node_51);
	var strong_25 = $.child(span_63);
	var text_143 = $.only_child(strong_25, true);
	var text_144 = $.sibling(strong_25, 1, true);

	$.reset(span_63);
	$.reset(div_97);

	var div_98 = $.sibling(div_97, 2);
	var node_52 = $.child(div_98);

	Clock(node_52, { class: 'h-5 w-5' });

	var span_64 = $.sibling(node_52);
	var strong_26 = $.child(span_64);
	var text_145 = $.only_child(strong_26, true);
	var text_146 = $.sibling(strong_26, 1, true);

	$.reset(span_64);
	$.reset(div_98);
	$.reset(div_94);

	var form_2 = $.sibling(div_94, 2);
	var label_7 = $.child(form_2);
	var text_147 = $.child(label_7, true);
	var input_4 = $.sibling(text_147);

	$.reset(label_7);

	var label_8 = $.sibling(label_7, 2);
	var text_148 = $.child(label_8, true);
	var input_5 = $.sibling(text_148);

	$.reset(label_8);

	var label_9 = $.sibling(label_8, 2);
	var text_149 = $.child(label_9, true);
	var input_6 = $.sibling(text_149);

	$.reset(label_9);

	var label_10 = $.sibling(label_9, 2);
	var text_150 = $.child(label_10, true);
	var select_2 = $.sibling(text_150);

	$.each(select_2, 21, () => $.get(contactForm)?.subjectOptions ?? [], $.index, ($$anchor, subject) => {
		var option_2 = root_20();
		var text_151 = $.only_child(option_2, true);
		var option_2_value = {};

		$.template_effect(() => {
			$.set_text(text_151, $.get(subject));

			if (option_2_value !== (option_2_value = $.get(subject))) {
				option_2.__value = option_2_value;
			}
		});

		$.append($$anchor, option_2);
	});

	$.reset(select_2);
	$.reset(label_10);

	var label_11 = $.sibling(label_10, 2);
	var text_152 = $.child(label_11, true);
	var textarea_1 = $.sibling(text_152);

	$.reset(label_11);

	var button_3 = $.sibling(label_11, 2);
	var node_53 = $.child(button_3);

	Send(node_53, { class: 'h-4 w-4' });

	var text_153 = $.sibling(node_53, 1, true);

	$.reset(button_3);
	$.reset(form_2);
	$.reset(div_93);
	$.reset(div_91);
	$.reset(section_13);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_text(text, $$props.themeContent.hero.bgText);
			$.set_text(text_1, $$props.themeContent.hero.badge);
			$.set_text(text_2, `${$$props.themeContent.hero.titleLead ?? ''} `);
			$.set_text(text_3, $$props.themeContent.hero.titleAccent);
			$.set_text(text_4, $$props.themeContent.hero.titleRest);
			$.set_text(text_5, $$props.themeContent.hero.text);
			$.set_text(text_6, ` ${$$props.themeContent.hero.primaryCta ?? ''}`);
			$.set_text(text_7, ` ${$$props.themeContent.hero.secondaryCta ?? ''}`);
			$.set_attribute(div_7, 'aria-label', $$props.themeContent.hero.imageAlt);
			$.set_attribute(img, 'src', $0);
			$.set_attribute(img, 'alt', $$props.themeContent.hero.imageAlt);
			$.set_text(text_14, $$props.themeContent.category.label);
			$.set_text(text_15, `${$$props.themeContent.category.titleLead ?? ''} `);
			$.set_text(text_16, $$props.themeContent.category.titleAccent);
			$.set_text(text_17, $$props.themeContent.category.text);
			$.set_attribute(img_2, 'src', $1);
			$.set_attribute(img_2, 'alt', $$props.themeContent.about.primaryImageAlt);
			$.set_attribute(img_3, 'src', $2);
			$.set_attribute(img_3, 'alt', $$props.themeContent.about.secondaryImageAlt);
			$.set_text(text_22, $$props.themeContent.about.experienceValue);
			$.set_text(text_23, $$props.themeContent.about.experienceText);
			$.set_text(text_24, $$props.themeContent.about.label);
			$.set_text(text_25, $$props.themeContent.about.titleLead);
			$.set_text(text_26, $$props.themeContent.about.titleAccent);
			$.set_text(text_27, $$props.themeContent.about.text);
			$.set_text(text_30, ` ${$$props.themeContent.about.cta ?? ''}`);
			$.set_text(text_31, $$props.themeContent.menu.label);
			$.set_text(text_32, `${$$props.themeContent.menu.titleLead ?? ''} `);
			$.set_text(text_33, $$props.themeContent.menu.titleAccent);
			$.set_text(text_43, ` ${$$props.themeContent.menu.cta ?? ''}`);
			$.set_text(text_44, $$props.themeContent.special.label);
			$.set_text(text_45, `${$$props.themeContent.special.titleLead ?? ''} `);
			$.set_text(text_46, $$props.themeContent.special.titleAccent);
			$.set_text(text_47, $$props.themeContent.special.text);
			$.set_text(text_48, $.get(cdH));
			$.set_text(text_49, $.get(countdown)?.hoursLabel);
			$.set_text(text_50, $.get(cdM));
			$.set_text(text_51, $.get(countdown)?.minutesLabel);
			$.set_text(text_52, $.get(cdS));
			$.set_text(text_53, $.get(countdown)?.secondsLabel);
			$.set_text(text_54, ` ${$$props.themeContent.special.cta ?? ''}`);
			$.set_attribute(img_5, 'src', $3);
			$.set_attribute(img_5, 'alt', $$props.themeContent.special.imageAlt);
			$.set_text(text_55, $$props.themeContent.special.oldPrice);
			$.set_text(text_56, $$props.themeContent.special.price);
			$.set_text(text_57, $$props.themeContent.gallery.label);
			$.set_text(text_58, `${$$props.themeContent.gallery.titleLead ?? ''} `);
			$.set_text(text_59, $$props.themeContent.gallery.titleAccent);
			$.set_text(text_61, $$props.themeContent.history.label);
			$.set_text(text_62, `${$$props.themeContent.history.titleLead ?? ''} `);
			$.set_text(text_63, $$props.themeContent.history.titleAccent);
			$.set_text(text_67, $$props.themeContent.chefs.label);
			$.set_text(text_68, `${$$props.themeContent.chefs.titleLead ?? ''} `);
			$.set_text(text_69, $$props.themeContent.chefs.titleAccent);
			$.set_text(text_72, $$props.themeContent.hours.label);
			$.set_text(text_73, `${$$props.themeContent.hours.titleLead ?? ''} `);
			$.set_text(text_74, $$props.themeContent.hours.titleAccent);
			$.set_text(text_77, $$props.themeContent.hours.orderTitle);
			$.set_text(text_78, $$props.themeContent.hours.orderText);
			$.set_text(text_79, $$props.themeContent.hours.orderCta);
			$.set_text(text_80, $$props.themeContent.hours.locationTitle);
			$.set_text(text_81, $$props.themeContent.hours.addressLabel);
			$.set_text(text_82, $$props.themeContent.hours.address);
			$.set_text(text_83, $$props.themeContent.hours.phoneLabel);
			$.set_text(text_84, $$props.themeContent.hours.phone);
			$.set_text(text_85, $$props.themeContent.hours.emailLabel);
			$.set_text(text_86, $$props.themeContent.hours.email);
			$.set_text(text_87, $$props.themeContent.testimonials.label);
			$.set_text(text_88, `${$$props.themeContent.testimonials.titleLead ?? ''} `);
			$.set_text(text_89, $$props.themeContent.testimonials.titleAccent);
			$.set_text(text_93, $$props.themeContent.reservation.label);
			$.set_text(text_94, `${$$props.themeContent.reservation.titleLead ?? ''} `);
			$.set_text(text_95, $$props.themeContent.reservation.titleAccent);
			$.set_text(text_96, $$props.themeContent.reservation.text);
			$.set_text(text_97, $$props.themeContent.reservation.panelTitle);
			$.set_text(text_98, $$props.themeContent.reservation.panelText);
			$.set_text(text_99, $$props.themeContent.reservation.hoursLabel);
			$.set_text(text_100, $$props.themeContent.reservation.hours);
			$.set_text(text_101, $$props.themeContent.reservation.phoneLabel);
			$.set_text(text_102, $$props.themeContent.reservation.phone);
			$.set_text(text_103, $$props.themeContent.reservation.groupLabel);
			$.set_text(text_104, $$props.themeContent.reservation.group);
			$.set_text(text_105, $$props.themeContent.reservation.locationLabel);
			$.set_text(text_106, $$props.themeContent.reservation.location);
			$.set_text(text_107, $.get(reservationForm)?.nameLabel);
			$.set_attribute(input, 'placeholder', $.get(reservationForm)?.namePlaceholder);
			$.set_text(text_108, $.get(reservationForm)?.phoneLabel);
			$.set_attribute(input_1, 'placeholder', $.get(reservationForm)?.phonePlaceholder);
			$.set_text(text_109, $.get(reservationForm)?.emailLabel);
			$.set_attribute(input_2, 'placeholder', $.get(reservationForm)?.emailPlaceholder);
			$.set_text(text_110, $.get(reservationForm)?.guestsLabel);
			$.set_text(text_112, $.get(reservationForm)?.dateLabel);
			$.set_text(text_113, $.get(reservationForm)?.timeLabel);
			$.set_text(text_115, $.get(reservationForm)?.requestsLabel);
			$.set_attribute(textarea, 'placeholder', $.get(reservationForm)?.requestsPlaceholder);
			$.set_text(text_116, $$props.themeContent.reservation.cta);
			$.set_text(text_117, $$props.themeContent.blog.label);
			$.set_text(text_118, `${$$props.themeContent.blog.titleLead ?? ''} `);
			$.set_text(text_119, $$props.themeContent.blog.titleAccent);
			$.set_text(text_127, $$props.themeContent.newsletter.label);
			$.set_text(text_128, `${$$props.themeContent.newsletter.titleLead ?? ''} `);
			$.set_text(text_129, $$props.themeContent.newsletter.titleAccent);
			$.set_text(text_130, $$props.themeContent.newsletter.text);
			$.set_attribute(input_3, 'placeholder', $$props.themeContent.newsletter.placeholder);
			$.set_text(text_131, ` ${$$props.themeContent.newsletter.cta ?? ''}`);
			$.set_text(text_132, $$props.themeContent.newsletter.privacy);
			$.set_text(text_133, $$props.themeContent.contact.label);
			$.set_text(text_134, `${$$props.themeContent.contact.titleLead ?? ''} `);
			$.set_text(text_135, $$props.themeContent.contact.titleAccent);
			$.set_text(text_136, $$props.themeContent.contact.text);
			$.set_text(text_137, $$props.themeContent.contact.panelTitle);
			$.set_text(text_138, $$props.themeContent.contact.panelText);
			$.set_text(text_139, $$props.themeContent.contact.addressLabel);
			$.set_text(text_140, $$props.themeContent.contact.address);
			$.set_text(text_141, $$props.themeContent.contact.phoneLabel);
			$.set_text(text_142, $$props.themeContent.contact.phone);
			$.set_text(text_143, $$props.themeContent.contact.emailLabel);
			$.set_text(text_144, $$props.themeContent.contact.email);
			$.set_text(text_145, $$props.themeContent.contact.hoursLabel);
			$.set_text(text_146, $$props.themeContent.contact.hours);
			$.set_text(text_147, $.get(contactForm)?.nameLabel);
			$.set_attribute(input_4, 'placeholder', $.get(contactForm)?.namePlaceholder);
			$.set_text(text_148, $.get(contactForm)?.emailLabel);
			$.set_attribute(input_5, 'placeholder', $.get(contactForm)?.emailPlaceholder);
			$.set_text(text_149, $.get(contactForm)?.phoneLabel);
			$.set_attribute(input_6, 'placeholder', $.get(contactForm)?.phonePlaceholder);
			$.set_text(text_150, $.get(contactForm)?.subjectLabel);
			$.set_text(text_152, $.get(contactForm)?.messageLabel);
			$.set_attribute(textarea_1, 'placeholder', $.get(contactForm)?.messagePlaceholder);
			$.set_text(text_153, $$props.themeContent.contact.cta);
		},
		[
			() => themeImage($$props.themeContent.hero.image, 'wine-hero'),
			() => themeImage($$props.themeContent.about.primaryImage, 'wine-about-1'),
			() => themeImage($$props.themeContent.about.secondaryImage, 'wine-about-2'),
			() => themeImage($$props.themeContent.special.image, 'wine-offer')
		]
	);

	$.event('submit', form, (event) => event.preventDefault());
	$.event('submit', form_1, (event) => event.preventDefault());
	$.event('submit', form_2, (event) => event.preventDefault());
	$.append($$anchor, fragment);
	$.pop();
}