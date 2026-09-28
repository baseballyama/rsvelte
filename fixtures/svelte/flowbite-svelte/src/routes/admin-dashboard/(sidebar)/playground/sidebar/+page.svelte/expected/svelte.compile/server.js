import * as $ from 'svelte/internal/server';
import MetaTag from "../../../utils/MetaTag.svelte";
import Footer from "../../Footer.svelte";
import { Playground } from "flowbite-svelte-admin-dashboard";

export default function _page($$renderer) {
	const path = "/playground/sidebar";
	const description = "Playground Sidebar example - Flowbite Svelte Admin Dashboard";
	const metaTitle = "Flowbite Svelte Admin Dashboard - Playground Sidebar";
	const subtitle = "Playground Sidebar";

	MetaTag($$renderer, { path, description, title: metaTitle, subtitle });
	$$renderer.push(`<!----> <div id="main-content" class="relative mx-auto h-full w-full overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">`);
	Playground($$renderer, {});
	$$renderer.push(`<!----></div> `);
	Footer($$renderer, {});
	$$renderer.push(`<!---->`);
}