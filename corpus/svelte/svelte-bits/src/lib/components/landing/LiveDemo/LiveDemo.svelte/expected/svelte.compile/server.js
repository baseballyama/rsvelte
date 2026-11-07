import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import DemoPlaceholder from './DemoPlaceholder.svelte';
import './LiveDemo.css';

export default function LiveDemo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		$$renderer.push(`<section class="ln-demo-section"><div class="ln-demo-inner"><h2 class="ln-demo-title">See them in action</h2> <div class="ln-demo-grid"><!--[-->`);

		const each_array = $.ensure_array_like(CARDS);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let card = each_array[i];

			$$renderer.push(`<div${$.attr_class(`ln-demo-card ln-demo-card--span-${$.stringify(card.span)}`, void 0, { 'ln-demo-card--tall': card.tall, 'is-visible': visible[i] })}${$.attr_style(`transition-delay: ${$.stringify(i * 70)}ms;`)}><a${$.attr('href', card.href)} class="ln-demo-card-link"><div class="ln-demo-card-visual">`);
			DemoPlaceholder($$renderer, { variant: card.variant, active: visible[i] });
			$$renderer.push(`<!----></div> <div class="ln-demo-card-overlay"><span class="ln-demo-card-category">${$.escape(card.category)}</span> <span class="ln-demo-card-name">${$.escape(card.component)}</span></div></a></div>`);
		}

		$$renderer.push(`<!--]--></div></div></section>`);
	});
}