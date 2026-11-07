import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import ComponentMarquee from './ComponentMarquee.svelte';
import CategorySelector from './CategorySelector.svelte';
import VariantTabs from './VariantTabs.svelte';
import AITerminal from './AITerminal.svelte';
import StarCard from './StarCard.svelte';
import './Features.css';

export default function Features($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		let cardEls = Array(CARDS.length).fill(null);
		let visible = Array(CARDS.length).fill(false);

		onMount(() => {
			if (typeof IntersectionObserver === 'undefined') {
				visible = visible.map(() => true);

				return;
			}

			const io = new IntersectionObserver(
				(entries) => {
					for (const e of entries) {
						if (!e.isIntersecting) continue;

						const i = cardEls.indexOf(e.target);

						if (i === -1) continue;

						// Stagger using transition-delay via inline style on the element.
						const next = [...visible];

						next[i] = true;
						visible = next;
						io.unobserve(e.target);
					}
				},
				{ rootMargin: '-60px 0px' }
			);

			for (const el of cardEls) if (el) io.observe(el);

			return () => io.disconnect();
		});

		$$renderer.push(`<section class="ln-features-section"><div class="ln-features-inner"><h2 class="ln-features-title">What's inside</h2> <div class="ln-features-grid"><!--[-->`);

		const each_array = $.ensure_array_like(CARDS);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let card = each_array[i];

			$$renderer.push(`<div${$.attr_class(`ln-features-card ln-features-card--span-${$.stringify(card.span)}`, void 0, { 'is-visible': visible[i] })}${$.attr_style(`transition-delay: ${$.stringify(i * 70)}ms;`)}><div class="ln-features-card-visual">`);

			if (card.key === 'marquee') {
				$$renderer.push('<!--[0-->');
				ComponentMarquee($$renderer, {});
			} else if (card.key === 'orbit') {
				$$renderer.push('<!--[1-->');
				CategorySelector($$renderer, {});
			} else if (card.key === 'variants') {
				$$renderer.push('<!--[2-->');
				VariantTabs($$renderer, {});
			} else if (card.key === 'ai') {
				$$renderer.push('<!--[3-->');
				AITerminal($$renderer, {});
			} else if (card.key === 'stars') {
				$$renderer.push('<!--[4-->');
				StarCard($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="ln-features-card-body"><h3>${$.escape(card.title)}</h3> <p>${$.escape(card.desc)}</p></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
	});
}