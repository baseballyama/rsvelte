import * as $ from 'svelte/internal/server';
import Announcement from "$lib/components/announcement.svelte";
import BlocksNav from "$lib/components/blocks-nav.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import PageNav from "$lib/components/page-nav.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;
	const title = "Building Blocks for the Web";
	const description = "Clean, modern building blocks. Works with all Svelte projects. Copy and paste into your apps. Open Source. Free forever.";

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
					$$renderer.push(`<!---->Building Blocks for the Web`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageHeaderDescription($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Clean, modern building blocks. Works with all Svelte projects. Copy and paste into your apps. Open Source. Free forever.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageActions($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						href: '#blocks',
						size: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Browse Blocks`);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	PageNav($$renderer, {
		children: ($$renderer) => {
			BlocksNav($$renderer, {});
			$$renderer.push(`<!----> `);

			Button($$renderer, {
				size: 'sm',
				variant: 'secondary',
				href: '/blocks/sidebar',
				class: 'me-7 hidden shadow-none lg:flex',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Browse all blocks`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> <div class="container-wrapper flex-1 section-soft md:py-12"><div class="container">`);
	children?.($$renderer);
	$$renderer.push(`<!----></div></div>`);
}