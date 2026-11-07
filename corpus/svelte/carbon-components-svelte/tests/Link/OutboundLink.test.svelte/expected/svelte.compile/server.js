import * as $ from 'svelte/internal/server';
import OutboundLink from "carbon-components-svelte/Link/OutboundLink.svelte";

export default function OutboundLink_test($$renderer) {
	$$renderer.push(`<div data-testid="default">`);

	OutboundLink($$renderer, {
		href: 'https://www.carbondesignsystem.com/',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="custom">`);

	OutboundLink($$renderer, {
		href: 'https://www.carbondesignsystem.com/',
		assistiveText: '(opens in a new window)',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div data-testid="empty">`);

	OutboundLink($$renderer, {
		href: 'https://www.carbondesignsystem.com/',
		assistiveText: '',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Carbon Design System`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}