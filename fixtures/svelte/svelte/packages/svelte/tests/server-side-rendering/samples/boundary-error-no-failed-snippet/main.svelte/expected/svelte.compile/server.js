import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throws() {
			throw new Error('component error');
		}

		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<p>${$.escape(throws())}</p>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}