import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
import { ChevronDownOutline } from "flowbite-svelte-icons";

export default function Ontoggle($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Dropdown button`);
			ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		simple: true,
		ontoggle: (ev) => {
			// ontoggle fires on all state changes (open/closed), requiring the state check
			if (ev.newState === "closed") {
				console.log("closed by ontoggle");
			}
		},

		children: ($$renderer) => {
			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dashboard`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Settings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}