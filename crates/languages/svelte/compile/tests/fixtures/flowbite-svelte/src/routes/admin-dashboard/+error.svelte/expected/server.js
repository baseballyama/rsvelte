import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { NotFound, Maintenance, ServerError } from "flowbite-svelte-admin-dashboard";
import MetaTag from "./utils/MetaTag.svelte";

export default function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// import '../app.css';
		const pages = { 400: Maintenance, 404: NotFound, 500: ServerError };

		const status = +page.status;
		const index = Object.keys(pages).map((x) => +x).reduce((p, c) => p < status ? c : p);
		const component = pages[index];
		const path = `/errors/${index}`;
		const description = `${index} - Flowbite Svelte Admin Dashboard`;
		const title = `Flowbite Svelte Admin Dashboard - ${index} page`;
		const subtitle = `${index} page`;

		MetaTag($$renderer, { path, description, title, subtitle });
		$$renderer.push(`<!----> `);

		if (component) {
			$$renderer.push('<!--[-->');
			component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}