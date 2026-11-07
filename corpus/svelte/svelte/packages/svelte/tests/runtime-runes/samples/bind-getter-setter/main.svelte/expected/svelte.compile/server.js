import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let a = 0;
	let check = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		var bind_get = () => a;

		var bind_set = (v) => {
			console.log('a', v);
			a = v;
		};

		$$renderer.push(`<button>a: ${$.escape(a)}</button> `);

		Child($$renderer, {
			get a() {
				return bind_get();
			},

			set a($$value) {
				bind_set($$value);
			}
		});

		$$renderer.push(`<!----> <div><input type="checkbox"${$.attr('checked', (() => check)(), true)}/></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}