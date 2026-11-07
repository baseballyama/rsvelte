import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Main($$renderer) {
	let bar;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('1h99yi7', $$renderer, ($$renderer) => {
			$$renderer.push(`<link rel="canonical" href="/test"/> <meta name="description" content="test"/>`);
		});

		Foo($$renderer, {
			get bar() {
				return bar;
			},

			set bar($$value) {
				bar = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}