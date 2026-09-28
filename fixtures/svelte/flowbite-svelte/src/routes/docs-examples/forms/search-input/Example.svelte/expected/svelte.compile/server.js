import * as $ from 'svelte/internal/server';
import { Search, Button, P } from "flowbite-svelte";

export default function Example($$renderer) {
	let value = "";

	const submitted = (e) => {
		e.preventDefault();
		alert(`You are searching: ${value}`);
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<form id="example-form">`);

		Search($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'my-1',
			children: ($$renderer) => {
				$$renderer.push(`<!---->You are searching: ${$.escape(value)}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			type: 'submit',
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