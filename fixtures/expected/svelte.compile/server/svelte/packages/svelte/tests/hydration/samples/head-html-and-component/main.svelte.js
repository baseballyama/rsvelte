import * as $ from 'svelte/internal/server';
import HeadNested from './HeadNested.svelte';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	$.head('1bef04p', $$renderer, ($$renderer) => {
		if (true) {
			$$renderer.push(`<!--[0-->${$.html('<meta name="main_html" content="main_html">')} <meta name="main" content="main"/> `);
			HeadNested($$renderer, {});
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});

	Nested($$renderer, {});
}