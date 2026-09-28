import * as $ from 'svelte/internal/server';
import { A, P } from "flowbite-svelte";
import { ArrowRightOutline } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->500,000 people have made over a million apps with Glide. `);

			A($$renderer, {
				href: '/',
				color: 'primary',
				class: 'inline-flex items-center font-medium  hover:underline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Read their stories `);
					ArrowRightOutline($$renderer, { class: 'ms-2 h-6 w-6' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}