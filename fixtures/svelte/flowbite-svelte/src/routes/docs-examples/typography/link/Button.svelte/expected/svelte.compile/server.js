import * as $ from 'svelte/internal/server';
import { A } from "flowbite-svelte";

export default function Button($$renderer) {
	let show_full_link = false;

	A($$renderer, {
		asButton: true,
		onclick: () => show_full_link = !show_full_link,
		children: ($$renderer) => {
			$$renderer.push(`<!---->view full link`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (show_full_link) {
		$$renderer.push(`<!--[0--><p>The full link is now visible.</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}