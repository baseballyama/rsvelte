import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import Metadata from "$lib/components/metadata.svelte";
import AppSidebar from "./components/app-sidebar.svelte";
import ChartAreaInteractive from "./components/chart-area-interactive.svelte";
import DataTable from "./components/data-table.svelte";
import SectionCards from "./components/section-cards.svelte";
import SiteHeader from "./components/site-header.svelte";
import { data } from "./data.js";

export default function _page($$renderer) {
	const title = "Dashboard";
	const description = "A dashboard built using the components.";

	Metadata($$renderer, {
		title,
		description,
		ogImage: {
			url: `/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`
		}
	});

	$$renderer.push(`<!----> <div class="md:hidden"><img src="/img/examples/dashboard-light.png"${$.attr('width', 1280)}${$.attr('height', 843)} alt="Dashboard" class="block dark:hidden"/> <img src="/img/examples/dashboard-dark.png"${$.attr('width', 1280)}${$.attr('height', 843)} alt="Dashboard" class="hidden dark:block"/></div> `);

	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			class: 'hidden md:flex',
			style: '--sidebar-width: calc(var(--spacing) * 64); --header-height: calc(var(--spacing) * 12 + 1px);',
			children: ($$renderer) => {
				AppSidebar($$renderer, { variant: 'sidebar' });
				$$renderer.push(`<!----> `);

				if (Sidebar.Inset) {
					$$renderer.push('<!--[-->');

					Sidebar.Inset($$renderer, {
						children: ($$renderer) => {
							SiteHeader($$renderer, {});
							$$renderer.push(`<!----> <div class="flex flex-1 flex-col"><div class="@container/main flex flex-1 flex-col gap-2"><div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">`);
							SectionCards($$renderer, {});
							$$renderer.push(`<!----> <div class="px-4 lg:px-6">`);
							ChartAreaInteractive($$renderer, {});
							$$renderer.push(`<!----></div> `);
							DataTable($$renderer, { data });
							$$renderer.push(`<!----></div></div></div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}