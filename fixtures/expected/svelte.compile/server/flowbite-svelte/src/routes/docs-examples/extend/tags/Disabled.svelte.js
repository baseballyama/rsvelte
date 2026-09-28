import * as $ from 'svelte/internal/server';
import { Button, Tags } from "flowbite-svelte";

export default function Disabled($$renderer) {
	let tags = ["foo", "bar"];

	const handleClick = () => {
		alert(`Submitted: ${tags}`);
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form>`);

		Tags($$renderer, {
			disabled: true,
			class: 'mt-5 mb-3',
			get value() {
				return tags;
			},

			set value($$value) {
				tags = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: handleClick,
			disabled: true,
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