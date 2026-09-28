import * as $ from 'svelte/internal/server';
import { Dropdown, DropdownItem } from "flowbite-svelte";
import { DotsHorizontalOutline, DotsVerticalOutline } from "flowbite-svelte-icons";

export default function Menu($$renderer) {
	DotsHorizontalOutline($$renderer, { class: 'dots-menu dark:text-white' });
	$$renderer.push(`<!----> `);
	DotsVerticalOutline($$renderer, { class: 'dots-menu dark:text-white' });
	$$renderer.push(`<!----> `);

	Dropdown($$renderer, {
		simple: true,
		triggeredBy: '.dots-menu',
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

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Earnings`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			DropdownItem($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Sign out`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}