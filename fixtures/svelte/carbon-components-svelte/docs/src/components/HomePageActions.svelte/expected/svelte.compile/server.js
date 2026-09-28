import * as $ from 'svelte/internal/server';
import { Button, Stack } from "carbon-components-svelte";
import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";

export default function HomePageActions($$renderer) {
	Stack($$renderer, {
		orientation: 'horizontal',
		gap: 4,
		align: 'center',
		wrap: 'wrap',
		children: ($$renderer) => {
			Button($$renderer, {
				icon: ArrowRight,
				href: '/quick-start',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Get started`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				kind: 'tertiary',
				icon: LogoGithub,
				href: 'https://github.com/carbon-design-system/carbon-components-svelte',
				target: '_blank',
				children: ($$renderer) => {
					$$renderer.push(`<!---->View on GitHub`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}