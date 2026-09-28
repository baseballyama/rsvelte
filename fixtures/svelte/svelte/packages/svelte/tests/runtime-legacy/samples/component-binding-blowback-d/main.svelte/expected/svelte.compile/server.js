import * as $ from 'svelte/internal/server';
import One from "./One.svelte";

export default function Main($$renderer) {
	const obj = { a: [{}], b: [] };
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		One($$renderer, {
			i: 0,
			get list() {
				return obj.a;
			},

			set list($$value) {
				obj.a = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		One($$renderer, {
			i: 1,
			get list() {
				return obj.b;
			},

			set list($$value) {
				obj.b = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <p>${$.escape(obj.a.map(JSON.stringify))}</p> <p>${$.escape(obj.b.map(JSON.stringify))}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}