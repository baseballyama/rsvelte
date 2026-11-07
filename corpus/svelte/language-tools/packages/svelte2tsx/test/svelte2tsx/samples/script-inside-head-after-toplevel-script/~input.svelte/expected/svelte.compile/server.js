import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	let b = 'top level';

	$.head('1vb9gze', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="stylesheet" href="/lib/jodit.es2018.min.css"/> `);

		$$renderer.push(`<script src="/lib/jodit.es2018.min.js">

  </script>`);
	});

	$$renderer.push(`<div>`);
	$$renderer.push(`<script>let a = 'not top level';</script>`);
	$$renderer.push(`<!----></div>`);
}