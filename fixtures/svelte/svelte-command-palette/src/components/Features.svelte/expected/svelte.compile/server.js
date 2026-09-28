import * as $ from 'svelte/internal/server';

export default function Features($$renderer) {
	const features = [
		{
			icon: '⌨️',
			title: 'Keyboard First',
			description: 'Full keyboard navigation with customizable shortcuts. Works seamlessly with your existing keybindings.'
		},

		{
			icon: '🔍',
			title: 'Fuzzy Search',
			description: 'Powered by Fuse.js for intelligent, typo-tolerant search across titles, descriptions, and keywords.'
		},

		{
			icon: '🎨',
			title: 'Fully Customizable',
			description: 'Style every element with CSS classes or inline styles. Or go completely unstyled for total control.'
		},

		{
			icon: '♿',
			title: 'Accessible',
			description: 'ARIA compliant with focus management, screen reader support, and keyboard trap handling.'
		},

		{
			icon: '📦',
			title: 'Lightweight',
			description: 'Only ~5KB gzipped with zero dependencies besides Svelte itself. No bloat, just features.'
		},

		{
			icon: '🔷',
			title: 'TypeScript Ready',
			description: 'Written in TypeScript with full type definitions. Enjoy autocomplete and type safety.'
		}
	];

	$$renderer.push(`<section class="features section svelte-84hc0p"><div class="container"><div class="features-header svelte-84hc0p"><span class="badge svelte-84hc0p">Features</span> <h2 class="svelte-84hc0p">Everything you need,<br/>nothing you don't</h2> <p class="svelte-84hc0p">Built with developer experience in mind. Get up and running in minutes.</p></div> <div class="feature-grid"><!--[-->`);

	const each_array = $.ensure_array_like(features);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let feature = each_array[$$index];

		$$renderer.push(`<div class="card feature-card svelte-84hc0p"><div class="feature-icon svelte-84hc0p">${$.escape(feature.icon)}</div> <h3 class="svelte-84hc0p">${$.escape(feature.title)}</h3> <p class="svelte-84hc0p">${$.escape(feature.description)}</p></div>`);
	}

	$$renderer.push(`<!--]--></div></div></section>`);
}