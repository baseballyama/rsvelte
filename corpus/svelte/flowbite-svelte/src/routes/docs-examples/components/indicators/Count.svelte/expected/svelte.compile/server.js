import * as $ from 'svelte/internal/server';
import { Indicator, Button } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

export default function Count($$renderer) {
	Button($$renderer, {
		size: 'lg',
		class: 'relative',
		children: ($$renderer) => {
			EnvelopeSolid($$renderer, { class: 'me-2 h-6 w-6 text-white dark:text-white' });
			$$renderer.push(`<!----> <span class="sr-only">Notifications</span> Messages `);

			Indicator($$renderer, {
				color: 'red',
				border: true,
				size: 'xl',
				placement: 'top-right',
				children: ($$renderer) => {
					$$renderer.push(`<span class="text-xs font-bold text-white">8</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}