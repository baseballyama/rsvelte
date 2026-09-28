import * as $ from 'svelte/internal/server';
import { Clipboard, Input } from "flowbite-svelte";
import { CheckOutline } from "flowbite-svelte-icons";

export default function Default($$renderer) {
	let value = "npm install flowbite";
	let success = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Input($$renderer, {
			class: 'w-64',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Clipboard($$renderer, {
			class: 'w-24',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			get success() {
				return success;
			},

			set success($$value) {
				success = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				if (success) {
					$$renderer.push('<!--[0-->');
					CheckOutline($$renderer, {});
				} else {
					$$renderer.push(`<!--[-1-->Copy`);
				}

				$$renderer.push(`<!--]-->`);
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