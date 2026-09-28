import * as $ from 'svelte/internal/server';
import Wrapper from './Wrapper.svelte';

export default function Main($$renderer) {
	$.head('1xpjprw', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="canonical" href="/test"/> <meta name="description" content="test"/>`);
	});

	Wrapper($$renderer, {});
	$$renderer.push(`<!----> `);
	Wrapper($$renderer, {});
	$$renderer.push(`<!----> `);
	Wrapper($$renderer, {});
	$$renderer.push(`<!---->`);
}