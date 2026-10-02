import * as $ from 'svelte/internal/server';
import { TextareaAutosize } from "runed";
import { DemoContainer, Textarea } from "@svecodocs/kit";

export default function Textarea_autosize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let element = null;
		let input = "";

		new TextareaAutosize({ element: () => element, input: () => input });

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			DemoContainer($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<label class="block" for="textarea-auto">Behold, the growing textarea!</label> `);

					Textarea($$renderer, {
						class: 'mt-2 min-h-2 resize-none',
						id: 'textarea-auto',
						placeholder: 'Type a lot, and you\'ll see me grow',
						get value() {
							return input;
						},

						set value($$value) {
							input = $$value;
							$$settled = false;
						},

						get ref() {
							return element;
						},

						set ref($$value) {
							element = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}