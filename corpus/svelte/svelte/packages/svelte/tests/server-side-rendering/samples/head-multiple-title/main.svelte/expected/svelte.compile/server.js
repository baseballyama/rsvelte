import * as $ from 'svelte/internal/server';
import A from './A.svelte';
import B from './B.svelte';

export default function Main($$renderer) {
	$.head('1ivchbz', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Main</title>`);
		});
	});

	A($$renderer, {});
	$$renderer.push(`<!----> `);
	B($$renderer, {});
	$$renderer.push(`<!---->`);
}