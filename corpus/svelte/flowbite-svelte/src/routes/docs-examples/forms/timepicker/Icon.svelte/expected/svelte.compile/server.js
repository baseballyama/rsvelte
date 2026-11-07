import * as $ from 'svelte/internal/server';
import { Label, Timepicker } from "flowbite-svelte";
import { ClockOutline } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select Time (Flowbite Icon):`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Timepicker($$renderer, { Icon: ClockOutline, iconClass: 'text-red-500' });
	$$renderer.push(`<!----> `);

	Label($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Select Time (Default icon):`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Timepicker($$renderer, {});
	$$renderer.push(`<!---->`);
}