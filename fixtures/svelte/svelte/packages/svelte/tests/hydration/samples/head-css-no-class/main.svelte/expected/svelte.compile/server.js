import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.head('rtybfk', $$renderer, ($$renderer) => {
		$$renderer.push(`<meta name="author" content="Re:Designed"/> <link rel="author" href="https://example.com"/> `);
		$$renderer.push(`<script type="application/ld+json"></script>`);
	});

	$$renderer.push(`<div class="svelte-rtybfk">dummy</div>`);
}