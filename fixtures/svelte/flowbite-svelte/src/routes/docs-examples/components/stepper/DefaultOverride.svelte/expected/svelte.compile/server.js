import * as $ from 'svelte/internal/server';
import { Stepper, P, Heading } from "flowbite-svelte";
import { CheckOutline, UserCircleOutline, BadgeCheckOutline } from "flowbite-svelte-icons";

export default function DefaultOverride($$renderer) {
	let current = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-2 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Example 5: With custom status override`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			class: 'mb-2 text-sm text-gray-600',
			children: ($$renderer) => {
				$$renderer.push(`<!---->These statuses are hardcoded and ignore the \`current\` prop`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Stepper($$renderer, {
			steps: [
				{
					label: "Personal",
					description: "Info",
					status: "completed",
					icon: UserCircleOutline
				},

				{
					label: "Account",
					description: "Info",
					status: "current",
					icon: BadgeCheckOutline
				},
				{ label: "Confirmation", status: "pending", icon: CheckOutline }
			],
			clickable: false,
			get current() {
				return current;
			},

			set current($$value) {
				current = $$value;
				$$settled = false;
			}
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