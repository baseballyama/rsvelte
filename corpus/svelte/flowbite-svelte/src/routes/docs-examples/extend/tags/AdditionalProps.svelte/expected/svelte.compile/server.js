import * as $ from 'svelte/internal/server';
import { Tags, Button } from "flowbite-svelte";

export default function AdditionalProps($$renderer) {
	let tags = [];

	const available = [
		"svelte",
		"react",
		"vue",
		"angular",
		"javascript",
		"typescript",
		"flowbite",
		"flowbite-svelte",
		"tailwindcss"
	];

	const handleClick = () => {
		alert(`Submitted: ${tags.join(", ")}`);
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form class="mx-auto space-y-4">`);

		Tags($$renderer, {
			class: 'mt-5 mb-3',
			unique: true,
			availableTags: available,
			allowNewTags: false,
			showHelper: true,
			showAvailableTags: true,
			placeholder: 'Add tag',
			get value() {
				return tags;
			},

			set value($$value) {
				tags = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		if (tags.length > 0) {
			$$renderer.push(`<!--[0--><div class="rounded bg-gray-100 p-4"><strong>Selected Tags:</strong> <pre>${$.escape(JSON.stringify(tags, null, 2))}</pre></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Button($$renderer, {
			onclick: handleClick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Submit`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></form>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}