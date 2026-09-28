import * as $ from 'svelte/internal/server';

export default function _layout($$renderer, $$props) {
	$$renderer.push(`<a href="/prerendering/env/prerendered">prerendered</a> <a href="/prerendering/env/dynamic">dynamic</a> <!--[-->`);
	$.slot($$renderer, $$props, 'default', {}, null);
	$$renderer.push(`<!--]-->`);
}