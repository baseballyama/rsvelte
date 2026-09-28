import * as $ from 'svelte/internal/server';
import Announcement from "$lib/components/announcement.svelte";
import ChartsNav from "$lib/components/charts-nav.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import PageNav from "$lib/components/page-nav.svelte";
import ThemeSelector from "$lib/components/theme-selector.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;
	const title = "Beautiful Charts & Graphs";
	const description = "A collection of ready-to-use chart components built with LayerChart. From basic charts to rich data displays, copy and paste into your apps.";

	Metadata($$renderer, {
		title,
		description,
		ogImage: {
			url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
		}
	});

	$$renderer.push(`<!----> `);

	PageHeader($$renderer, {
		children: ($$renderer) => {
			Announcement($$renderer, {});
			$$renderer.push(`<!----> `);

			PageHeaderHeading($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Beautiful Charts &amp; Graphs`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageHeaderDescription($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->A collection of ready-to-use chart components built with LayerChart. From basic charts to rich data displays, copy and paste into your apps.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageActions($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						href: '#charts',
						size: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Browse Charts`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						href: '/docs/components/chart',
						variant: 'ghost',
						size: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Documentation`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PageNav($$renderer, {
		id: 'charts',
		children: ($$renderer) => {
			ChartsNav($$renderer, {});
			$$renderer.push(`<!----> `);
			ThemeSelector($$renderer, { class: 'me-4 hidden md:flex' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="container-wrapper flex-1 section-soft"><div class="container pb-6"><section class="theme-container">`);
	children?.($$renderer);
	$$renderer.push(`<!----></section></div></div>`);
}