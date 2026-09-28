import * as $ from 'svelte/internal/server';
import { TimelineStepper, Button, P, Heading } from "flowbite-svelte";

import {
	UserCircleOutline,
	CogOutline,
	EyeOutline,
	CheckCircleOutline
} from "flowbite-svelte-icons";

export default function TimelineIcon($$renderer) {
	let current = 1;

	const steps = [
		{
			id: 1,
			label: "Profile",
			description: "Setup your profile",
			icon: UserCircleOutline,
			iconClass: "h-5 w-5"
		},

		{
			id: 2,
			label: "Settings",
			description: "Configure your settings",
			icon: CogOutline,
			iconClass: "h-5 w-5"
		},

		{
			id: 3,
			label: "Review",
			description: "Review your information",
			icon: EyeOutline,
			iconClass: "h-5 w-5"
		},

		{
			id: 4,
			label: "Complete",
			description: "All done!",
			icon: CheckCircleOutline,
			iconClass: "h-5 w-5"
		}
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Heading($$renderer, {
			tag: 'h3',
			class: 'mb-4 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Timeline Stepper with Custom Icons`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TimelineStepper($$renderer, {
			steps,
			get current() {
				return current;
			},

			set current($$value) {
				current = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		Heading($$renderer, {
			tag: 'h3',
			class: 'mt-8 mb-4 text-lg font-semibold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->With icons, no checkmarks (keeps custom icons for completed steps)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		TimelineStepper($$renderer, {
			steps,
			showCheckmarkForCompleted: false,
			get current() {
				return current;
			},

			set current($$value) {
				current = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div class="mt-8 flex gap-4">`);

		Button($$renderer, {
			onclick: () => current = Math.max(0, current - 1),
			disabled: current === 0,
			class: 'rounded bg-gray-500 px-4 py-2 disabled:opacity-50',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Previous`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			onclick: () => current = Math.min(steps.length, current + 1),
			disabled: current === steps.length,
			class: 'rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Next`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="mt-4 rounded bg-gray-50 p-4 dark:bg-gray-800">`);

		Heading($$renderer, {
			tag: 'h4',
			class: 'font-bold',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Current Step`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<strong>${$.escape(current === 0 ? "None (all pending)" : steps[current - 1].label)}</strong> (Step ${$.escape(current)} of ${$.escape(steps.length)})`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}