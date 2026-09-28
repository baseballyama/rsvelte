import * as $ from 'svelte/internal/server';
import { Checkbox, Listgroup } from "flowbite-svelte";

export default function ListGroup($$renderer) {
	$$renderer.push(`<p class="mb-4 font-semibold text-gray-900 dark:text-white">Technology</p> `);

	Listgroup($$renderer, {
		class: 'w-48',
		children: ($$renderer) => {
			$$renderer.push(`<li>`);

			Checkbox($$renderer, {
				classes: { div: "p-3" },
				children: ($$renderer) => {
					$$renderer.push(`<!---->svelte`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li> <li>`);

			Checkbox($$renderer, {
				classes: { div: "p-3" },
				children: ($$renderer) => {
					$$renderer.push(`<!---->Vue JS`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li> <li>`);

			Checkbox($$renderer, {
				classes: { div: "p-3" },
				children: ($$renderer) => {
					$$renderer.push(`<!---->React`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li> <li>`);

			Checkbox($$renderer, {
				classes: { div: "p-3" },
				children: ($$renderer) => {
					$$renderer.push(`<!---->Angular`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></li>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}