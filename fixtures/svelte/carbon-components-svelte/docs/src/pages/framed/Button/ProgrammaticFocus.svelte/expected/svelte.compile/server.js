import * as $ from 'svelte/internal/server';
import { Button } from "carbon-components-svelte";

export default function ProgrammaticFocus($$renderer) {
	let ref;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			get ref() {
				return ref;
			},

			set ref($$value) {
				ref = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Primary button`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			kind: 'ghost',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Click to focus the Primary button`);
			},
			$$slots: { default: true }
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