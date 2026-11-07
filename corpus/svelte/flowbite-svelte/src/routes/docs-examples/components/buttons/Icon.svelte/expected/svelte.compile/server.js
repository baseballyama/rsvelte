import * as $ from 'svelte/internal/server';
import { Button } from "flowbite-svelte";
import { ArrowRightOutline, CartSolid } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	Button($$renderer, {
		children: ($$renderer) => {
			CartSolid($$renderer, { class: 'me-2 h-5 w-5' });
			$$renderer.push(`<!----> Buy Now`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Choose Plan `);
			ArrowRightOutline($$renderer, { class: 'ms-2 h-5 w-5' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}