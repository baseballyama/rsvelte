import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let should_throw = false;

		function throw_error() {
			throw new Error('oops');
		}

		$$renderer.push(`<button>throw</button> `);
		$$renderer.push(`<!--[-->`);

		{
			$$renderer.push(`<p>some content</p> `);

			if (should_throw) {
				$$renderer.push(`<!--[0-->${$.escape(throw_error())}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]-->`);
	});
}