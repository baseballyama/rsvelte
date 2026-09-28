import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import AppSidebar from "./components/app-sidebar.svelte";
import ChartAreaInteractive from "./components/chart-area-interactive.svelte";
import DataTable from "./components/data-table.svelte";
import SectionCards from "./components/section-cards.svelte";
import SiteHeader from "./components/site-header.svelte";
import data from "./data.js";

export default function _page($$renderer) {
	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			style: '--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);',
			children: ($$renderer) => {
				AppSidebar($$renderer, { variant: 'inset' });
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