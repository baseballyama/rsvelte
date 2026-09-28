import * as $ from 'svelte/internal/server';
import ActionButton from './ActionButton.svelte';
import Feature from './home/Feature.svelte';

export default function Home($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			features = [],
			actions = [],
			tagline = '',
			siteConfig,
			heroImage,
			children
		} = $$props;

		$$renderer.push(`<div class="home-page svelte-n8u4in"><div class="title svelte-n8u4in"><div class="intro svelte-n8u4in"><h1 class="gradient-title svelte-n8u4in">${$.escape(siteConfig.title)}</h1> <div class="description svelte-n8u4in">${$.escape(siteConfig.description)}</div> `);

		if (tagline) {
			$$renderer.push(`<!--[0--><div class="tagline svelte-n8u4in">${$.escape(tagline)}</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (heroImage) {
			$$renderer.push('<!--[0-->');
			heroImage($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="actions svelte-n8u4in"><!--[-->`);

		const each_array = $.ensure_array_like(actions);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let action = each_array[$$index];

			ActionButton($$renderer, $.spread_props([action]));
		}

		$$renderer.push(`<!--]--></div> <div class="features svelte-n8u4in"><!--[-->`);

		const each_array_1 = $.ensure_array_like(features);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let fe = each_array_1[i];

			Feature($$renderer, $.spread_props([fe, { i }]));
		}

		$$renderer.push(`<!--]--></div></div> `);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}