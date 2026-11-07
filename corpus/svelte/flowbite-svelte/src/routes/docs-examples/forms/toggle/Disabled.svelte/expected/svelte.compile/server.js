import * as $ from 'svelte/internal/server';
import { Button, Toggle } from "flowbite-svelte";

export default function Disabled($$renderer) {
	let isDisabled = false;
	let checked = false;

	const handleClick = () => {
		isDisabled = !isDisabled;
	};

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			class: 'w-48',
			onclick: handleClick,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Disabled: ${$.escape(isDisabled ? "True" : "False")}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Toggle($$renderer, {
			class: 'mt-3',
			disabled: isDisabled,
			get checked() {
				return checked;
			},

			set checked($$value) {
				checked = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Disabled: ${$.escape(isDisabled)}`);
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