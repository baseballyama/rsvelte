import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function throw_error() {
			throw new Error('throw_error');
		}

		$$renderer.push(`<!---->${$.escape(throw_error())} <div>Foo</div>`);
	});
}