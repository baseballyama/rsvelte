import * as $ from 'svelte/internal/server';
import Home from './icons/Home.svelte';
import Link from './Link.svelte';

export default function Error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { error = {} } = $$props;

		$$renderer.push(`<div class="error svelte-14iphrm"><div class="code svelte-14iphrm">${$.escape(error.code || 404)}</div> <div class="title svelte-14iphrm">${$.escape(error.message || 'Not Found')}</div> `);

		{
			function pre($$renderer) {
				$$renderer.push(`<div class="home-icon svelte-14iphrm">`);
				Home($$renderer, {});
				$$renderer.push(`<!----></div>`);
			}

			Link($$renderer, { label: 'Take me home', to: '/', pre, $$slots: { pre: true } });
		}

		$$renderer.push(`<!----></div>`);
	});
}