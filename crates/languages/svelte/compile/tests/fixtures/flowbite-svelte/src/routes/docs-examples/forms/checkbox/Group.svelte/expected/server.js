import * as $ from 'svelte/internal/server';
import { Button, Checkbox } from "flowbite-svelte";

export default function Group($$renderer) {
	let choices = [
		{ value: "1", label: "One" },
		{ value: "2", label: "Two" },
		{ value: "3", label: "Three" }
	];

	let group = ["2", "3"];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="flex gap-2">`);

		Checkbox($$renderer, {
			name: 'flavours',
			choices,
			get group() {
				return group;
			},

			set group($$value) {
				group = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <div class="my-2 w-44 rounded-lg border border-gray-200 p-2 dark:border-gray-700 dark:text-gray-400">Group: ${$.escape(group)}</div> `);

		Button($$renderer, {
			onclick: () => group.length = 0,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Clear`);
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