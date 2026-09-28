import * as $ from 'svelte/internal/server';
import Inner from "./Inner.svelte";

export default function Main($$renderer) {
	let bar = 0;

	let foo = {
		get bar() {
			return bar;
		},

		set bar(v) {
			bar = v;
		}
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button>${$.escape(foo.bar)}</button> `);

		Inner($$renderer, {
			get bar() {
				return foo.bar;
			},

			set bar($$value) {
				foo.bar = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Inner($$renderer, { bar: foo.bar });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}