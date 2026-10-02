import * as $ from 'svelte/internal/server';
import Foo from './Foo.svelte';

export default function Wrapper($$renderer) {
	let bar = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
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