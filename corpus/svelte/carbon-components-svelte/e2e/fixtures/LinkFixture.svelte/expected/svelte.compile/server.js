import * as $ from 'svelte/internal/server';
import { Link } from "carbon-components-svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

export default function LinkFixture($$renderer) {
	Link($$renderer, {
		'data-testid': 'link-sm',
		size: 'sm',
		href: 'https://www.carbondesignsystem.com/',
		icon: Carbon,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Small`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Link($$renderer, {
		'data-testid': 'link-md',
		href: 'https://www.carbondesignsystem.com/',
		icon: Carbon,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Medium`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Link($$renderer, {
		'data-testid': 'link-lg',
		size: 'lg',
		href: 'https://www.carbondesignsystem.com/',
		icon: Carbon,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Large`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <p style="color: rgb(10, 20, 30);">Read the `);

	Link($$renderer, {
		'data-testid': 'link-muted',
		muted: true,
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> documentation.</p> <p style="color: rgb(10, 20, 30);">Read the `);

	Link($$renderer, {
		'data-testid': 'link-default',
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> documentation.</p>`);
}