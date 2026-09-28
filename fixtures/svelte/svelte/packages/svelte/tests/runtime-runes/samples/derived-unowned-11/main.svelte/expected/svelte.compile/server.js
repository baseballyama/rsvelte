import * as $ from 'svelte/internal/server';
import Child2 from './Child2.svelte';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let loginname = '';
	let password = '';
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Child($$renderer, {
			get value() {
				return loginname;
			},

			set value($$value) {
				loginname = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Child($$renderer, {
			get value() {
				return password;
			},

			set value($$value) {
				password = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);
		Child2($$renderer, { disabled: !loginname || !password });
		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}