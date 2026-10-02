import * as $ from 'svelte/internal/server';

function counter($$renderer, c) {
	if (c) {
		$$renderer.push(`<!--[0--><button>${$.escape(c.value)}</button>`);
	} else {
		$$renderer.push(`<!--[-1--><p>fallback</p>`);
	}

	$$renderer.push(`<!--]-->`);
}

export default function Main($$renderer) {
	function box(value) {
		let state = value;

		return {
			get value() {
				return state;
			},

			set value(v) {
				state = v;
			}
		};
	}

	let count = box(0);

	counter($$renderer);
	$$renderer.push(`<!----> `);
	counter($$renderer, count);
	$$renderer.push(`<!---->`);
}