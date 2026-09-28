import * as $ from 'svelte/internal/server';
import Link from "carbon-components-svelte/Link/Link.svelte";
import Carbon from "carbon-icons-svelte/lib/Carbon.svelte";

export default function Link_test($$renderer) {
	$$renderer.push(`<div data-testid="default-link">`);

	Link($$renderer, {
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-blank">`);

	Link($$renderer, {
		href: 'https://www.carbondesignsystem.com/',
		target: '_blank',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-inline">`);

	Link($$renderer, {
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-with-icon">`);

	Link($$renderer, {
		href: 'https://www.carbondesignsystem.com/',
		icon: Carbon,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-with-icon-slot">`);

	Link($$renderer, {
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},

		$$slots: {
			default: true,
			icon: ($$renderer) => {
				{
					Carbon($$renderer, {});
				}
			}
		}
	});

	$$renderer.push(`<!----></div> <div data-testid="link-large">`);

	Link($$renderer, {
		size: 'lg',
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-small">`);

	Link($$renderer, {
		size: 'sm',
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-small-icon">`);

	Link($$renderer, {
		size: 'sm',
		href: 'https://www.carbondesignsystem.com/',
		icon: Carbon,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-large-icon">`);

	Link($$renderer, {
		size: 'lg',
		href: 'https://www.carbondesignsystem.com/',
		icon: Carbon,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-disabled">`);

	Link($$renderer, {
		disabled: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-muted">`);

	Link($$renderer, {
		muted: true,
		inline: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="link-visited">`);

	Link($$renderer, {
		visited: true,
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}