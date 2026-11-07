import * as $ from 'svelte/internal/server';
import { DetailedStepper, P, Heading } from "flowbite-svelte";
import { BellOutline, ClipboardOutline, CogOutline } from "flowbite-svelte-icons";

export default function DetailedOverride($$renderer) {
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

	DetailedStepper($$renderer, {
		steps: [
			{
				id: 1,
				label: "Step 1",
				description: "Done",
				status: "completed",
				icon: BellOutline
			},

			{
				id: 2,
				label: "Step 2",
				description: "In progress",
				status: "current",
				icon: ClipboardOutline
			},

			{
				id: 3,
				label: "Step 3",
				description: "Pending",
				status: "pending",
				icon: CogOutline
			}
		],
		clickable: false
	});

	$$renderer.push(`<!---->`);
}