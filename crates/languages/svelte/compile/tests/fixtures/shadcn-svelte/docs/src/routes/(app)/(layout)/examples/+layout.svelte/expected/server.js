import * as $ from 'svelte/internal/server';
import Announcement from "$lib/components/announcement.svelte";
import ExamplesNav from "$lib/components/examples-nav.svelte";
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
	const title = "Examples";
	const description = "Check out some example apps build using the components.";

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
					$$renderer.push(`<!---->The Foundation for your Design System`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageHeaderDescription($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->A set of beautifully designed components that you can customize, extend, and build on. Start
		here then make it your own. Open Source. Open Code.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageActions($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						href: '/docs',
						size: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Get Started`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						href: '/blocks',
						size: 'sm',
						variant: 'ghost',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Browse Blocks`);
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
		id: 'examples',
		children: ($$renderer) => {
			ExamplesNav($$renderer, {
				class: 'flex-1 overflow-hidden [&>a:first-child]:text-primary'
			});

			$$renderer.push(`<!----> `);
			ThemeSelector($$renderer, { class: 'me-4 hidden md:block' });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="container-wrapper flex flex-1 flex-col section-soft pb-6"><div class="container flex flex-1 scroll-mt-20 flex-col theme-container"><div class="flex flex-col overflow-hidden rounded-lg border bg-background bg-clip-padding md:flex-1 xl:rounded-xl">`);
	children($$renderer);
	$$renderer.push(`<!----></div></div></div>`);
}