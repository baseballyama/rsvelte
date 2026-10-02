import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import Router, { push } from "svelte-spa-router";
import { getRoutes, getLinks } from "./helpers";

export default function Router_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { skin = void 0, onnewpage, productTag } = $$props;
		let page = void 0;
		let title;
		let link;
		let name;
		const baseLink = "https://github.com/svar-widgets/" + productTag + "/blob/main/svelte/demos/cases/";

		onMount(() => {
			onnewpage && onnewpage({ page, skin, title, link });
		});

		function onRouteChange(path) {
			const parts = path.split("/");

			page = parts[1];
			skin = parts[2];

			const tPage = `/${page}/:skin`;
			const matched = links.find((a) => a[0] === tPage);

			title = matched?.[1] ?? "";
			name = matched?.[3] ?? "";
			link = `${baseLink}${name.replace(/\s+/g, "")}.svelte`;
			onnewpage && onnewpage({ page, skin, title, link });
		}

		const links = getLinks();
		const routes = getRoutes({}, onRouteChange);

		Router($$renderer, { routes });
		$.bind_props($$props, { skin });
	});
}