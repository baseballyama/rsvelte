import * as $ from 'svelte/internal/server';
import MetaTag from './MetaTag.svelte';

export default function Main($$renderer) {
	$.head('13b6bfm', $$renderer, ($$renderer) => {
		$$renderer.push(`<script async="" src="https://www.googletagmanager.com/gtag/js?id=12345"></script>`);
		$$renderer.push(`<!---->`);
	});

	MetaTag($$renderer, {});
	$$renderer.push(`<!----> <div>Hello</div>`);
}