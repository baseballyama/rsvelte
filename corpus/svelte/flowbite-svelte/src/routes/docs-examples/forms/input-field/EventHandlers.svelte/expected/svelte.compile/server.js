import * as $ from 'svelte/internal/server';
import { Input, P } from "flowbite-svelte";

export default function EventHandlers($$renderer) {
	let value = "Custom Event Handlers";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		P($$renderer, {
			class: 'my-4',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(value)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Input($$renderer, {
			oninput: (e) => console.log("Custom input:", e),
			onfocus: () => console.log("Input focused"),
			onblur: () => console.log("Input blurred"),
			onkeydown: (e) => {
				if (e.key === "Tab") {
					console.log("Tab pressed");
				}
			},

			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
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