import * as $ from 'svelte/internal/server';
import { Link } from '$lib/components/ui/link';

export default function Link_1($$renderer) {
	$$renderer.push(`<p class="text-center">Crafted by `);

	Link($$renderer, {
		href: 'https://github.com/huntabyte',
		target: '_blank',
		children: ($$renderer) => {
			$$renderer.push(`<!---->huntabyte`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->, enhanced by `);

	Link($$renderer, {
		href: 'https://github.com/ieedan',
		target: '_blank',
		children: ($$renderer) => {
			$$renderer.push(`<!---->ieedan`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->.</p>`);
}