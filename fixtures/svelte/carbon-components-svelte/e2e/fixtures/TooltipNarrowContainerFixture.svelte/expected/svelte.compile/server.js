import * as $ from 'svelte/internal/server';
import Link from "carbon-components-svelte/Link/Link.svelte";
import Tooltip from "carbon-components-svelte/Tooltip/Tooltip.svelte";

export default function TooltipNarrowContainerFixture($$renderer) {
	$$renderer.push(`<div style="width: 230px;" data-testid="narrow-container">`);

	Tooltip($$renderer, {
		triggerText: 'Round robin',
		children: ($$renderer) => {
			$$renderer.push(`<p>Distributes requests evenly across servers. `);

			Link($$renderer, {
				href: 'https://en.wikipedia.org/wiki/Round-robin_DNS',
				target: '_blank',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Read more on Wikipedia`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></p>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}