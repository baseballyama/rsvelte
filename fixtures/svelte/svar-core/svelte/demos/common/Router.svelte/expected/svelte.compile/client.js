import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import Router, { push } from "svelte-spa-router";
import { getRoutes, getLinks } from "./helpers";

export default function Router_1($$anchor, $$props) {
	$.push($$props, true);

	let skin = $.prop($$props, 'skin', 15);
	let page = $.state(void 0);
	let title;
	let link;
	let name;
	const baseLink = "https://github.com/svar-widgets/" + $$props.productTag + "/blob/main/svelte/demos/cases/";

	$.user_effect(() => {
		if (skin() && $.get(page)) {
			push(`/${$.get(page)}/${skin()}`);
		}
	});

	onMount(() => {
		$$props.onnewpage && $$props.onnewpage({ page: $.get(page), skin: skin(), title, link });
	});

	function onRouteChange(path) {
		const parts = path.split("/");

		$.set(page, parts[1], true);
		skin(parts[2]);

		const tPage = `/${$.get(page)}/:skin`;
		const matched = links.find((a) => a[0] === tPage);

		title = matched?.[1] ?? "";
		name = matched?.[3] ?? "";
		link = `${baseLink}${name.replace(/\s+/g, "")}.svelte`;
		$$props.onnewpage && $$props.onnewpage({ page: $.get(page), skin: skin(), title, link });
	}

	const links = getLinks();
	const routes = getRoutes({}, onRouteChange);

	Router($$anchor, {
		get routes() {
			return routes;
		}
	});

	$.pop();
}