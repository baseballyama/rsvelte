import * as $ from 'svelte/internal/server';
import { page } from '$app/state';

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<h1>${$.escape(decodeURIComponent(page.url.pathname.split('/').pop() ?? ''))}</h1> <!--[-->`);
		$.slot($$renderer, $$props, 'default', {}, null);
		$$renderer.push(`<!--]--> <a href="/encoded/escape-sequences/:-)">:-)</a> <a href="/encoded/escape-sequences/%23">#</a> <a href="/encoded/escape-sequences/%2F">/</a> <a href="/encoded/escape-sequences/%3f">?</a> <a href="/encoded/escape-sequences/苗">苗</a> <a href="/encoded/escape-sequences/&lt;">&lt;</a> <a href="/encoded/escape-sequences/1&lt;2">1&lt;2</a> <a href="/encoded/escape-sequences/🤪">🤪</a> <a href="/encoded/escape-sequences/%25">%</a>`);
	});
}