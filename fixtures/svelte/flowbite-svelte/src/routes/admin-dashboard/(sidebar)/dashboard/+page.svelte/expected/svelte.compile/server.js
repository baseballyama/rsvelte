import * as $ from 'svelte/internal/server';
import Dashboard from "../../utils/dashboard/Dashboard.svelte";
import MetaTag from "../../utils/MetaTag.svelte";
import Footer from "../Footer.svelte";

export default function _page($$renderer) {
	// import type { PageProps } from './$types';
	// let { data }: PageProps = $props();
	// $inspect('data in dashboard/+page', data)
	const path = "/dashboard";

	const description = "Admin Dashboard example using Flowbite Svelte";
	const title = "Flowbite Svelte Admin Dashboard - Dashboard";
	const subtitle = "Admin Dashboard";

	MetaTag($$renderer, { path, description, title, subtitle });
	$$renderer.push(`<!----> <main class="p-4"><h1 class="hidden">Dashboard</h1> `);
	Dashboard($$renderer, {});
	$$renderer.push(`<!----></main> `);
	Footer($$renderer, {});
	$$renderer.push(`<!---->`);
}