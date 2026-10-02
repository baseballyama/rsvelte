import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { NotFound, Maintenance, ServerError } from "flowbite-svelte-admin-dashboard";
import MetaTag from "./utils/MetaTag.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	// import '../app.css';
	const pages = { 400: Maintenance, 404: NotFound, 500: ServerError };

	const status = +page.status;
	const index = Object.keys(pages).map((x) => +x).reduce((p, c) => p < status ? c : p);
	const component = pages[index];
	const path = `/errors/${index}`;
	const description = `${index} - Flowbite Svelte Admin Dashboard`;
	const title = `Flowbite Svelte Admin Dashboard - ${index} page`;
	const subtitle = `${index} page`;
	var fragment = root();
	var node = $.first_child(fragment);

	MetaTag(node, {
		get path() {
			return path;
		},

		get description() {
			return description;
		},

		get title() {
			return title;
		},

		get subtitle() {
			return subtitle;
		}
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => component, ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}