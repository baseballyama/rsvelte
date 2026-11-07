import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throw_error() {
			throw new Error('test');
		}

		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<!---->${$.escape(throw_error())}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}