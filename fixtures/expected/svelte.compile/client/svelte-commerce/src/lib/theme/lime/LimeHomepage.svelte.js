import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Plus,
	MapPin,
	BadgeCheck,
	RefreshCw,
	Tag,
	Truck,
	Undo2,
	Store
} from '@lucide/svelte';

import LimeProductCard from './LimeProductCard.svelte';
import { themeImage } from '../placeholder.js';

var root = $.from_html(`<a class="lime-category svelte-bqnxlw"><img class="svelte-bqnxlw"/> <h3 class="svelte-bqnxlw"> </h3></a>`);
var root_1 = $.from_html(`<a class="lime-collage-large svelte-bqnxlw"><img class="svelte-bqnxlw"/></a>`);
var root_2 = $.from_html(`<a class="svelte-bqnxlw"><img class="svelte-bqnxlw"/></a>`);
var root_3 = $.from_html(`<section class="lime-collage svelte-bqnxlw"><!> <div class="lime-collage-stack svelte-bqnxlw"></div></section>`);
var root_4 = $.from_html(`<section class="lime-split-campaign svelte-bqnxlw"></section>`);
var root_5 = $.from_html(`<a class="lime-demand-feature svelte-bqnxlw"><img class="svelte-bqnxlw"/> <span class="svelte-bqnxlw"> </span></a>`);
var root_6 = $.from_html(`<div class="lime-product-empty svelte-bqnxlw"><h4 class="svelte-bqnxlw"> </h4> <p class="svelte-bqnxlw"> </p></div>`);
var root_7 = $.from_html(`<h2 class="lime-trust-heading svelte-bqnxlw"> </h2>`);
var root_8 = $.from_html(`<p class="lime-trust-item svelte-bqnxlw"><!> <span> </span></p>`);
var root_9 = $.from_html(`<section class="lime-trust svelte-bqnxlw"><!> <div class="lime-trust-grid svelte-bqnxlw"></div></section>`);
var root_10 = $.from_html(`<details class="svelte-bqnxlw"><summary class="svelte-bqnxlw"> <!></summary> <p class="svelte-bqnxlw"> </p></details>`);
var root_11 = $.from_html(`<div class="lime-home svelte-bqnxlw"><section class="lime-hero svelte-bqnxlw"><h1 class="lime-hero-title sr-only"> </h1> <img class="svelte-bqnxlw"/></section> <section class="lime-categories svelte-bqnxlw"><div class="lime-section-heading svelte-bqnxlw"><h2 class="svelte-bqnxlw"> </h2> <p class="svelte-bqnxlw"> </p></div> <div class="lime-category-row svelte-bqnxlw"></div></section> <!> <!> <section class="lime-demand svelte-bqnxlw"><!> <div class="lime-product-grid svelte-bqnxlw"><!></div></section> <!> <section class="lime-story svelte-bqnxlw"><img class="svelte-bqnxlw"/> <div><h2 class="svelte-bqnxlw"> </h2> <p class="svelte-bqnxlw"> </p> <a href="/about-us" class="svelte-bqnxlw"> </a></div></section> <section class="lime-store svelte-bqnxlw"><div class="svelte-bqnxlw"><h2 class="svelte-bqnxlw"> </h2> <p class="svelte-bqnxlw"> </p> <a href="/contact-us" class="svelte-bqnxlw"><!> </a></div> <img class="svelte-bqnxlw"/></section> <section class="lime-faq svelte-bqnxlw"><h2 class="svelte-bqnxlw"> </h2> <div class="lime-faq-list svelte-bqnxlw"></div></section></div>`);

export default function LimeHomepage($$anchor, $$props) {
	$.push($$props, true);

	let featuredCategories = $.prop($$props, 'featuredCategories', 19, () => []),
		featuredProducts = $.prop($$props, 'featuredProducts', 19, () => []);

	let subscribing = $.state(false);

	// Live catalogue categories win; the theme's tiles are the fallback for an empty store.
	const categories = $.derived(() => featuredCategories()?.length
		? featuredCategories().slice(0, 7).map((category) => ({
			title: category?.name || category?.title || '',
			href: category?.slug ? '/' + category.slug : category?.link || '/products',
			image: category?.image || category?.thumbnail || category?.img || '',
			imageAlt: ''
		}))
		: $$props.themeContent.tiles?.categories ?? []);

	const collage = $.derived(() => $$props.themeContent.tiles?.collage ?? []);
	const featureTile = $.derived(() => $$props.themeContent.tiles?.feature);
	const trust = $.derived(() => $$props.themeContent.trust);

	// The source rendered each trust point as a text-in-image badge. Those are real icons and
	// real text now, so the section needs no asset files and stays readable at any size.
	const TRUST_ICONS = [
		[/certif/i, BadgeCheck],
		[/exchange/i, RefreshCw],
		[/pricing|price/i, Tag],
		[/shipping|delivery/i, Truck],
		[/return/i, Undo2],
		[/store|support/i, Store]
	];

	const trustIcon = (title = '') => TRUST_ICONS.find(([pattern]) => pattern.test(title))?.[1] ?? BadgeCheck;
	const faq = $.derived(() => $$props.themeContent.faq);

	async function subscribe() {
		$.set(subscribing, true);
		await new Promise((resolve) => setTimeout(resolve, 700));
		$.set(subscribing, false);
	}

	var div = root_11();
	var section = $.child(div);
	var h1 = $.child(section);
	var text = $.only_child(h1, true);
	var img = $.sibling(h1, 2);

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var div_1 = $.child(section_1);
	var h2 = $.child(div_1);
	var text_1 = $.only_child(h2, true);
	var p = $.sibling(h2, 2);
	var text_2 = $.only_child(p, true);

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.each(div_2, 21, () => $.get(categories), $.index, ($$anchor, category) => {
		var a = root();
		var img_1 = $.child(a);
		var h3 = $.sibling(img_1, 2);
		var text_3 = $.only_child(h3, true);

		$.reset(a);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', $.get(category).href);
				$.set_attribute(img_1, 'src', $0);
				$.set_attribute(img_1, 'alt', $.get(category).imageAlt || $.get(category).title);
				$.set_text(text_3, $.get(category).title);
			},
			[
				() => themeImage($.get(category).image, $.get(category).title)
			]
		);

		$.append($$anchor, a);
	});

	$.reset(div_2);
	$.reset(section_1);

	var node = $.sibling(section_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var section_2 = root_3();
			var node_1 = $.child(section_2);

			{
				var consequent = ($$anchor) => {
					var a_1 = root_1();
					var img_2 = $.only_child(a_1);

					$.template_effect(
						($0) => {
							$.set_attribute(a_1, 'href', $.get(collage)[0].href);
							$.set_attribute(img_2, 'src', $0);
							$.set_attribute(img_2, 'alt', $.get(collage)[0].imageAlt || $.get(collage)[0].title || '');
						},
						[
							() => themeImage($.get(collage)[0].image, $.get(collage)[0].imageAlt || $.get(collage)[0].href)
						]
					);

					$.append($$anchor, a_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(collage)[0]) $$render(consequent);
				});
			}

			var div_3 = $.sibling(node_1, 2);

			$.each(div_3, 21, () => $.get(collage).slice(1, 3), $.index, ($$anchor, tile) => {
				var a_2 = root_2();
				var img_3 = $.only_child(a_2);

				$.template_effect(
					($0) => {
						$.set_attribute(a_2, 'href', $.get(tile).href);
						$.set_attribute(img_3, 'src', $0);
						$.set_attribute(img_3, 'alt', $.get(tile).imageAlt || $.get(tile).title || '');
					},
					[
						() => themeImage($.get(tile).image, $.get(tile).imageAlt || $.get(tile).href)
					]
				);

				$.append($$anchor, a_2);
			});

			$.reset(div_3);
			$.reset(section_2);
			$.append($$anchor, section_2);
		};

		$.if(node, ($$render) => {
			if ($.get(collage)[0] || $.get(collage)[1] || $.get(collage)[2]) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_2 = ($$anchor) => {
			var section_3 = root_4();

			$.each(section_3, 21, () => $.get(collage).slice(3, 5), $.index, ($$anchor, tile) => {
				var a_3 = root_2();
				var img_4 = $.only_child(a_3);

				$.template_effect(
					($0) => {
						$.set_attribute(a_3, 'href', $.get(tile).href);
						$.set_attribute(img_4, 'src', $0);
						$.set_attribute(img_4, 'alt', $.get(tile).imageAlt || $.get(tile).title || '');
					},
					[
						() => themeImage($.get(tile).image, $.get(tile).imageAlt || $.get(tile).href)
					]
				);

				$.append($$anchor, a_3);
			});

			$.reset(section_3);
			$.append($$anchor, section_3);
		};

		$.if(node_2, ($$render) => {
			if ($.get(collage).length > 3) $$render(consequent_2);
		});
	}

	var section_4 = $.sibling(node_2, 2);
	var node_3 = $.child(section_4);

	{
		var consequent_3 = ($$anchor) => {
			var a_4 = root_5();
			var img_5 = $.child(a_4);
			var span = $.sibling(img_5, 2);
			var text_4 = $.only_child(span, true);

			$.reset(a_4);

			$.template_effect(
				($0) => {
					$.set_attribute(a_4, 'href', $.get(featureTile).href);
					$.set_attribute(img_5, 'src', $0);
					$.set_attribute(img_5, 'alt', $.get(featureTile).imageAlt || $.get(featureTile).title || '');
					$.set_text(text_4, $.get(featureTile).title);
				},
				[
					() => themeImage($.get(featureTile).image, 'lime-feature', 'dark')
				]
			);

			$.append($$anchor, a_4);
		};

		$.if(node_3, ($$render) => {
			if ($.get(featureTile)) $$render(consequent_3);
		});
	}

	var div_4 = $.sibling(node_3, 2);
	var node_4 = $.child(div_4);

	{
		var consequent_4 = ($$anchor) => {
			var fragment = $.comment();
			var node_5 = $.first_child(fragment);

			$.each(node_5, 17, () => featuredProducts().slice(0, 4), $.index, ($$anchor, product) => {
				LimeProductCard($$anchor, {
					get product() {
						return $.get(product);
					},

					get themeContent() {
						return $$props.themeContent;
					},
					aspectRatio: '1'
				});
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var div_5 = root_6();
			var h4 = $.child(div_5);
			var text_5 = $.only_child(h4, true);
			var p_1 = $.sibling(h4, 2);
			var text_6 = $.only_child(p_1, true);

			$.reset(div_5);

			$.template_effect(() => {
				$.set_text(text_5, $$props.themeContent.menu.emptyTitle);
				$.set_text(text_6, $$props.themeContent.menu.emptyText);
			});

			$.append($$anchor, div_5);
		};

		$.if(node_4, ($$render) => {
			if (featuredProducts().length > 0) $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	$.reset(div_4);
	$.reset(section_4);

	var node_6 = $.sibling(section_4, 2);

	{
		var consequent_6 = ($$anchor) => {
			var section_5 = root_9();
			var node_7 = $.child(section_5);

			{
				var consequent_5 = ($$anchor) => {
					var h2_1 = root_7();
					var text_7 = $.only_child(h2_1, true);

					$.template_effect(() => $.set_text(text_7, $.get(trust).title));
					$.append($$anchor, h2_1);
				};

				$.if(node_7, ($$render) => {
					if ($.get(trust).title) $$render(consequent_5);
				});
			}

			var div_6 = $.sibling(node_7, 2);

			$.each(div_6, 21, () => $.get(trust).items, $.index, ($$anchor, item, index) => {
				const TrustIcon = $.derived(() => trustIcon($.get(item).title));
				var p_2 = root_8();
				var node_8 = $.child(p_2);

				$.component(node_8, () => $.get(TrustIcon), ($$anchor, TrustIcon_1) => {
					TrustIcon_1($$anchor, { 'aria-hidden': 'true' });
				});

				var span_1 = $.sibling(node_8, 2);
				var text_8 = $.only_child(span_1, true);

				$.reset(p_2);
				$.template_effect(() => $.set_text(text_8, $.get(item).title || `${$$props.brandName} trust point ${index + 1}`));
				$.append($$anchor, p_2);
			});

			$.reset(div_6);
			$.reset(section_5);
			$.append($$anchor, section_5);
		};

		$.if(node_6, ($$render) => {
			if ($.get(trust)?.items?.length) $$render(consequent_6);
		});
	}

	var section_6 = $.sibling(node_6, 2);
	var img_6 = $.child(section_6);
	var div_7 = $.sibling(img_6, 2);
	var h2_2 = $.child(div_7);
	var text_9 = $.only_child(h2_2, true);
	var p_3 = $.sibling(h2_2, 2);
	var text_10 = $.only_child(p_3, true);
	var a_5 = $.sibling(p_3, 2);
	var text_11 = $.only_child(a_5, true);

	$.reset(div_7);
	$.reset(section_6);

	var section_7 = $.sibling(section_6, 2);
	var div_8 = $.child(section_7);
	var h2_3 = $.child(div_8);
	var text_12 = $.only_child(h2_3);
	var p_4 = $.sibling(h2_3, 2);
	var text_13 = $.only_child(p_4, true);
	var a_6 = $.sibling(p_4, 2);
	var node_9 = $.child(a_6);

	MapPin(node_9, { class: 'h-4 w-4' });

	var text_14 = $.sibling(node_9, 1, true);

	$.reset(a_6);
	$.reset(div_8);

	var img_7 = $.sibling(div_8, 2);

	$.reset(section_7);

	var section_8 = $.sibling(section_7, 2);
	var h2_4 = $.child(section_8);
	var text_15 = $.only_child(h2_4, true);
	var div_9 = $.sibling(h2_4, 2);

	$.each(div_9, 21, () => $.get(faq)?.items ?? [], $.index, ($$anchor, item, index) => {
		var details = root_10();

		details.open = index === 0;

		var summary = $.child(details);
		var text_16 = $.child(summary, true);
		var node_10 = $.sibling(text_16);

		Plus(node_10, { class: 'lime-faq-icon h-4 w-4' });
		$.reset(summary);

		var p_5 = $.sibling(summary, 2);
		var text_17 = $.only_child(p_5, true);

		$.reset(details);

		$.template_effect(() => {
			$.set_text(text_16, $.get(item).question);
			$.set_text(text_17, $.get(item).answer);
		});

		$.append($$anchor, details);
	});

	$.reset(div_9);
	$.reset(section_8);
	$.reset(div);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_attribute(section, 'aria-label', `${$$props.brandName ?? ''} hero`);
			$.set_text(text, $0);
			$.set_attribute(img, 'src', $1);
			$.set_attribute(img, 'alt', $$props.themeContent.hero.imageAlt);
			$.set_text(text_1, $$props.themeContent.category.label);
			$.set_text(text_2, $$props.themeContent.category.text);
			$.set_attribute(img_6, 'src', $2);
			$.set_attribute(img_6, 'alt', $$props.themeContent.about.primaryImageAlt);
			$.set_text(text_9, $$props.themeContent.about.label);
			$.set_text(text_10, $$props.themeContent.about.text);
			$.set_text(text_11, $$props.themeContent.about.cta);
			$.set_text(text_12, `${$$props.themeContent.special.titleLead ?? ''} ${$$props.themeContent.special.titleAccent ?? ''}`);
			$.set_text(text_13, $$props.themeContent.special.text);
			$.set_text(text_14, $$props.themeContent.special.cta);
			$.set_attribute(img_7, 'src', $3);
			$.set_attribute(img_7, 'alt', $$props.themeContent.special.imageAlt);
			$.set_text(text_15, $.get(faq)?.label);
		},
		[
			() => [
				$$props.themeContent.hero?.titleLead,
				$$props.themeContent.hero?.titleAccent
			].filter(Boolean).join(' ') || $$props.brandName,
			() => themeImage($$props.themeContent.hero.image, 'lime-hero'),
			() => themeImage($$props.themeContent.about.primaryImage, 'lime-story'),
			() => themeImage($$props.themeContent.special.image, 'lime-store')
		]
	);

	$.append($$anchor, div);
	$.pop();
}