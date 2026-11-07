import * as $ from 'svelte/internal/server';
import Dashboard from "../../../utils/dashboard/Dashboard.svelte";
import MetaTag from "../../../utils/MetaTag.svelte";
import Footer from "../../Footer.svelte";

export default function _page($$renderer) {
	const path = "/layouts/sidebar";
	const description = "Sidebar layout examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - Sidebar Layout";
	const subtitle = "Sidebar Layout";

	MetaTag($$renderer, { path, description, title, subtitle });
	$$renderer.push(`<!----> <main class="p-4"><h1 class="hidden">Layouts: Sidebar</h1> `);
	Dashboard($$renderer, {});
	$$renderer.push(`<!----></main> `);
	Footer($$renderer, {});
	$$renderer.push(`<!---->`);
}