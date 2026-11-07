import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Hello from SvelteKit on Vercel</h1> <nav><a href="/server-data">Server Data</a> <a href="/isr">ISR</a> <a href="/isr/hello">ISR Dynamic</a> <a href="/prerendered">Prerendered</a> <a href="/deep/nested/route">Deep Nested</a></nav>`, 1);

export default function _page($$anchor) {
	var fragment = root();

	$.next(2);
	$.append($$anchor, fragment);
}