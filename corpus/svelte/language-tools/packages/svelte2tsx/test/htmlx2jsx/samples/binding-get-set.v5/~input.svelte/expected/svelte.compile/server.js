import * as $ from 'svelte/internal/server';

export default function Input_1($$renderer) {
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		var bind_get = get;
		var bind_set = set;
		var bind_get_1 = () => v;
		var bind_set_1 = (new_v) => v = new_v;

		$$renderer.push(`<input${$.attr('value', get())}/> <input${$.attr('value', (() => v)())}/> <div></div> <div></div> `);

		Input($$renderer, {
			get value() {
				return bind_get();
			},

			set value($$value) {
				bind_set($$value);
			}
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			get value() {
				return bind_get_1();
			},

			set value($$value) {
				bind_set_1($$value);
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}