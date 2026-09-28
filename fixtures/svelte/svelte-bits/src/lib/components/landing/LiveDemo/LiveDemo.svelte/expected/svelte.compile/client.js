import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import DemoPlaceholder from './DemoPlaceholder.svelte';
import './LiveDemo.css';

var root = $.from_html(`<div><a class="ln-demo-card-link"><div class="ln-demo-card-visual"><!></div> <div class="ln-demo-card-overlay"><span class="ln-demo-card-category"> </span> <span class="ln-demo-card-name"> </span></div></a></div>`);
var root_1 = $.from_html(`<section class="ln-demo-section"><div class="ln-demo-inner"><h2 class="ln-demo-title">See them in action</h2> <div class="ln-demo-grid"></div></div></section>`);

export default function LiveDemo($$anchor, $$props) {
	$.push($$props, true);

	const CARDS = [
		{
			variant: 'shapegrid',
			category: 'Backgrounds',
			component: 'ShapeGrid',
			href: '/backgrounds/shape-grid',
			span: 7,
			tall: true
		},

		{
			variant: 'magicrings',
			category: 'Animations',
			component: 'MagicRings',
			href: '/animations/magic-rings',
			span: 5,
			tall: true
		},

		{
			variant: 'shinytext',
			category: 'Text Animations',
			component: 'ShinyText',
			href: '/text-animations/shiny-text',
			span: 4
		},

		{
			variant: 'dock',
			category: 'Components',
			component: 'Dock',
			href: '/components/dock',
			span: 8
		}
	];

	let cardEls = $.proxy(Array(CARDS.length).fill(null));
	let visible = $.state($.proxy(Array(CARDS.length).fill(false)));

	onMount(() => {
		if (typeof IntersectionObserver === 'undefined') {
			$.set(visible, $.get(visible).map(() => true), true);

			return;
		}

		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;

					const i = cardEls.indexOf(e.target);

					if (i === -1) continue;

					const next = [...$.get(visible)];

					next[i] = true;
					$.set(visible, next, true);
					io.unobserve(e.target);
				}
			},
			{ rootMargin: '-60px 0px' }
		);

		for (const el of cardEls) if (el) io.observe(el);

		return () => io.disconnect();
	});

	var section = root_1();
	var div = $.child(section);
	var div_1 = $.sibling($.child(div), 2);

	$.each(div_1, 23, () => CARDS, (card) => card.variant, ($$anchor, card, i) => {
		var div_2 = root();
		let classes;
		var a = $.child(div_2);
		var div_3 = $.child(a);
		var node = $.child(div_3);

		DemoPlaceholder(node, {
			get variant() {
				return $.get(card).variant;
			},

			get active() {
				return $.get(visible)[$.get(i)];
			}
		});

		$.reset(div_3);

		var div_4 = $.sibling(div_3, 2);
		var span = $.child(div_4);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1, true);

		$.reset(div_4);
		$.reset(a);
		$.reset(div_2);
		$.bind_this(div_2, ($$value, i) => cardEls[i] = $$value, (i) => cardEls?.[i], () => [$.get(i)]);

		$.template_effect(() => {
			classes = $.set_class(div_2, 1, `ln-demo-card ln-demo-card--span-${$.get(card).span ?? ''}`, null, classes, {
				'ln-demo-card--tall': $.get(card).tall,
				'is-visible': $.get(visible)[$.get(i)]
			});

			$.set_style(div_2, `transition-delay: ${$.get(i) * 70}ms;`);
			$.set_attribute(a, 'href', $.get(card).href);
			$.set_text(text, $.get(card).category);
			$.set_text(text_1, $.get(card).component);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}