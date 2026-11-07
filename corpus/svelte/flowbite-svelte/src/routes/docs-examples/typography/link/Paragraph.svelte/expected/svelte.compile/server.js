import * as $ from 'svelte/internal/server';
import { A, P } from "flowbite-svelte";

export default function Paragraph($$renderer) {
	P($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->The free updates that will be provided is based on the `);

			A($$renderer, {
				href: '/',
				class: 'underline hover:no-underline',
				children: ($$renderer) => {
					$$renderer.push(`<!---->roadmap`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> that we have laid out for this project. It is also possible that we will provide extra
  updates outside of the roadmap as well.`);
		},
		$$slots: { default: true }
	});
}