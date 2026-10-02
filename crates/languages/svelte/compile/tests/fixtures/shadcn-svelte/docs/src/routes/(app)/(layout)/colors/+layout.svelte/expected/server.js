import * as $ from 'svelte/internal/server';
import Announcement from "$lib/components/announcement.svelte";
import ColorsNav from "$lib/components/colors-nav.svelte";
import Metadata from "$lib/components/metadata.svelte";
import PageActions from "$lib/components/page-header/page-actions.svelte";
import PageHeaderDescription from "$lib/components/page-header/page-header-description.svelte";
import PageHeaderHeading from "$lib/components/page-header/page-header-heading.svelte";
import PageHeader from "$lib/components/page-header/page-header.svelte";
import Button from "$lib/registry/ui/button/button.svelte";

export default function _layout($$renderer, $$props) {
	const title = "Tailwind Colors in Every Format";
	const description = "The complete Tailwind color palette in HEX, RGB, HSL, CSS variables, and classes. Ready to copy and paste into your project.";
	let { children } = $$props;

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
					$$renderer.push(`<!---->Tailwind Colors in Every Format`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageHeaderDescription($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->The complete Tailwind color palette in HEX, RGB, HSL, CSS variables, and classes. Ready to copy and paste into your project.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			PageActions($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						href: '#colors',
						size: 'sm',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Browse Colors`);
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

	$$renderer.push(`<!----> <div class="hidden"><div class="container-wrapper"><div class="container flex items-center justify-between gap-8 py-4">`);

	ColorsNav($$renderer, {
		class: 'flex-1 overflow-hidden [&>a:first-child]:text-primary'
	});

	$$renderer.push(`<!----></div></div></div> <div class="container-wrapper"><div class="container py-6"><section id="colors" class="scroll-mt-20">`);
	children?.($$renderer);
	$$renderer.push(`<!----></section></div></div></div>`);
}