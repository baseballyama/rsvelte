import * as $ from 'svelte/internal/server';
import HeadNested from './HeadNested.svelte';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	$.head('xs8ykv', $$renderer, ($$renderer) => {
		$$renderer.push(`${$.html('<meta name="main_html" content="main_html">')} <meta name="main" content="main"/> `);
		HeadNested($$renderer, {});
		$$renderer.push(`<!---->`);
	});

	Nested($$renderer, {});
}