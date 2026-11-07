import * as $ from 'svelte/internal/server';
import { Checkbox, Listgroup } from "flowbite-svelte";

export default function ListGroup2($$renderer) {
	let choices = [
		{ value: "svelte", label: "svelte" },
		{ value: "vue", label: "Vue JS" },
		{ value: "react", label: "React", checked: true },
		{ value: "angular", label: "Angular" }
	];

	let group = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<p class="my-2">Choices: ${$.escape(group.join(", "))}</p> `);

		Listgroup($$renderer, {
			class: 'w-48',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					choices,
					classes: { div: "p-3" },
					get group() {
						return group;
					},

					set group($$value) {
						group = $$value;
						$$settled = false;
					}
				});
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