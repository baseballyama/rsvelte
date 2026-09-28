import * as $ from 'svelte/internal/server';
import { Button, Dropdown, DropdownItem, P } from "flowbite-svelte";
import { ChevronDownOutline, ChevronRightOutline } from "flowbite-svelte-icons";

export default function Programatic($$renderer) {
	let isOpen = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Current dropdown state: ${$.escape(isOpen ? "Open" : "Closed")}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => isOpen = false,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Close Btn`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => isOpen = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Dropdown`);
				ChevronDownOutline($$renderer, { class: 'ms-2 h-6 w-6 text-white dark:text-white' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Dropdown($$renderer, {
			simple: true,
			get isOpen() {
				return isOpen;
			},

			set isOpen($$value) {
				isOpen = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				DropdownItem($$renderer, {
					onclick: () => isOpen = false,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dashboard (close)`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				DropdownItem($$renderer, {
					class: 'flex items-center justify-between',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Dropdown`);
						ChevronRightOutline($$renderer, { class: 'text-primary-700 ms-2 h-6 w-6 dark:text-white' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Dropdown($$renderer, {
					simple: true,
					placement: 'right-start',
					children: ($$renderer) => {
						DropdownItem($$renderer, {
							onclick: () => isOpen = false,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Overview (close)`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->My downloads`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						DropdownItem($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Billing`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}