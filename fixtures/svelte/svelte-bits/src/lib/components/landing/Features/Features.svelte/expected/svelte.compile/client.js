import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import ComponentMarquee from './ComponentMarquee.svelte';
import CategorySelector from './CategorySelector.svelte';
import VariantTabs from './VariantTabs.svelte';
import AITerminal from './AITerminal.svelte';
import StarCard from './StarCard.svelte';
import './Features.css';

var root = $.from_html(`<div><div class="ln-features-card-visual"><!></div> <div class="ln-features-card-body"><h3> </h3> <p> </p></div></div>`);
var root_1 = $.from_html(`<section class="ln-features-section"><div class="ln-features-inner"><h2 class="ln-features-title">What's inside</h2> <div class="ln-features-grid"></div></div></section>`);

export default function Features($$anchor, $$props) {
	$.push($$props, true);

	const CARDS = [
		{
			key: 'marquee',
			title: '130+ Components',
			desc: "Backgrounds, text effects, animations, UI patterns. The stuff you'd build from scratch, already done.",
			span: 7
		},

		{
			key: 'orbit',
			title: 'Well Organized',
			desc: "Four clear categories so you're not scrolling through a wall of unrelated stuff.",
			span: 5
		},

		{
			key: 'variants',
			title: 'TypeScript + Tailwind',
			desc: 'Every component ships as a typed Svelte 5 component styled with Tailwind. One stack, done right.',
			span: 4
		},

		{
			key: 'ai',
			title: 'AI-Ready',
			desc: 'Works great with Cursor, Copilot, and v0. Describe what you need, drop it in, ship.',
			span: 5
		},

		{
			key: 'stars',
			title: 'Growing Fast',
			desc: "Svelte's newest creative component library. Star us on GitHub to follow along.",
			span: 3
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

					// Stagger using transition-delay via inline style on the element.
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

	$.each(div_1, 23, () => CARDS, (card) => card.key, ($$anchor, card, i) => {
		var div_2 = root();
		let classes;
		var div_3 = $.child(div_2);
		var node = $.child(div_3);

		{
			var consequent = ($$anchor) => {
				ComponentMarquee($$anchor, {});
			};

			var consequent_1 = ($$anchor) => {
				CategorySelector($$anchor, {});
			};

			var consequent_2 = ($$anchor) => {
				VariantTabs($$anchor, {});
			};

			var consequent_3 = ($$anchor) => {
				AITerminal($$anchor, {});
			};

			var consequent_4 = ($$anchor) => {
				StarCard($$anchor, {});
			};

			$.if(node, ($$render) => {
				if ($.get(card).key === 'marquee') $$render(consequent); else if ($.get(card).key === 'orbit') $$render(consequent_1, 1); else if ($.get(card).key === 'variants') $$render(consequent_2, 2); else if ($.get(card).key === 'ai') $$render(consequent_3, 3); else if ($.get(card).key === 'stars') $$render(consequent_4, 4);
			});
		}

		$.reset(div_3);

		var div_4 = $.sibling(div_3, 2);
		var h3 = $.child(div_4);
		var text = $.only_child(h3, true);
		var p = $.sibling(h3, 2);
		var text_1 = $.only_child(p, true);

		$.reset(div_4);
		$.reset(div_2);
		$.bind_this(div_2, ($$value, i) => cardEls[i] = $$value, (i) => cardEls?.[i], () => [$.get(i)]);

		$.template_effect(() => {
			classes = $.set_class(div_2, 1, `ln-features-card ln-features-card--span-${$.get(card).span ?? ''}`, null, classes, { 'is-visible': $.get(visible)[$.get(i)] });
			$.set_style(div_2, `transition-delay: ${$.get(i) * 70}ms;`);
			$.set_text(text, $.get(card).title);
			$.set_text(text_1, $.get(card).desc);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
	$.pop();
}