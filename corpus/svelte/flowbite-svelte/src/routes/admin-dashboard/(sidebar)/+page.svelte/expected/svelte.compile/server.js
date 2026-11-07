import * as $ from 'svelte/internal/server';
import Dashboard from "../utils/dashboard/Dashboard.svelte";
import MetaTag from "../utils/MetaTag.svelte";

export default function _page($$renderer) {
	const path = "";
	const description = "Admin Dashboard example using Flowbite Svelte";
	const title = "Flowbite Svelte Admin Dashboard - Home";
	const subtitle = "Admin Dashboard";

	MetaTag($$renderer, { path, description, title, subtitle });
	$$renderer.push(`<!----> <main class="p-4"><h1 class="hidden">Dashboard</h1> `);
	Dashboard($$renderer, {});
	$$renderer.push(`<!----></main>`);
}