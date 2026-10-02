import * as $ from 'svelte/internal/server';
import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';

export default function BackgroundContentToggle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			headline = 'Build interfaces that feel alive',
			showContent = true,
			onToggle
		} = $$props;

		$$renderer.push(`<div class="bg-content-root svelte-1hm6q66" aria-hidden="true"><div class="bg-content-toggle-wrap svelte-1hm6q66"><label class="bg-content-switch-row svelte-1hm6q66"><span>Demo Content</span> <input type="checkbox"${$.attr('checked', showContent, true)} class="svelte-1hm6q66"/> <span class="bg-content-switch svelte-1hm6q66" aria-hidden="true"></span></label></div> `);

		if (showContent) {
			$$renderer.push(`<!--[0--><div class="bg-content-nav-wrap svelte-1hm6q66"><div class="bg-content-nav bg-content-glass svelte-1hm6q66"><div class="bg-content-logo-wrap svelte-1hm6q66"><img${$.attr('src', logo)} alt="" class="svelte-1hm6q66"/></div> <div class="bg-content-menu-icon svelte-1hm6q66"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line></svg></div> <div class="bg-content-nav-links svelte-1hm6q66"><span class="svelte-1hm6q66">Features</span> <span class="svelte-1hm6q66">About</span> <span class="bg-content-signup svelte-1hm6q66">Sign up</span></div></div></div> <div class="bg-content-hero svelte-1hm6q66"><div class="bg-content-tag bg-content-glass svelte-1hm6q66"><span class="bg-content-tag-new svelte-1hm6q66">New</span> <span class="svelte-1hm6q66">Just shipped v2.0</span></div> <h2 class="svelte-1hm6q66">${$.escape(headline)}</h2> <div class="bg-content-actions svelte-1hm6q66"><span class="bg-content-primary svelte-1hm6q66">Get started</span> <span class="bg-content-secondary bg-content-glass svelte-1hm6q66">Learn more</span></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}