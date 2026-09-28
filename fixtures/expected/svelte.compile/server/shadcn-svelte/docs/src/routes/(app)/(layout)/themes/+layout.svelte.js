import * as $ from 'svelte/internal/server';
import Announcement from "$lib/components/announcement.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;
	const title = "Pick a Color. Make it yours.";
	const description = "Try our hand-picked themes. Copy and paste them into your project. New theme editor coming soon.";

	Metadata($$renderer, {
		title,
		description,
		ogImage: {
			url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
		}
	});

	$$renderer.push(`<!----> <div>`);

	PageHeader($$renderer, {
		children: ($$renderer) => {
			Announcement($$renderer, {});
			$$renderer.push(`<!----> `);

			PageHeaderHeading($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Pick a Color. Make it yours.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageHeaderDescription($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->Try our hand-picked themes. Copy and paste them into your project. New theme editor coming soon.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageActions($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						href: '#themes',
						size: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Browse Themes`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						href: '/docs/theming',
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
	children($$renderer);
	$$renderer.push(`<!----></div>`);
}