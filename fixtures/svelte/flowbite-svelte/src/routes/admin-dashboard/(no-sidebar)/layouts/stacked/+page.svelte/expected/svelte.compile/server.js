import * as $ from 'svelte/internal/server';
import Dashboard from "../../../utils/dashboard/Dashboard.svelte";
import MetaTag from "../../../utils/MetaTag.svelte";

export default function _page($$renderer) {
	const path = "/layouts/stacked";
	const description = "Stacked layout examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - Stacked Layout";
	const subtitle = "Stacked Layout";

	MetaTag($$renderer, { path, description, title, subtitle });
	$$renderer.push(`<!----> <main class="py-4"><h1 class="hidden">Layouts: Stacked</h1> `);
	Dashboard($$renderer, {});
	$$renderer.push(`<!----></main>`);
}