import * as $ from 'svelte/internal/server';
import Router, { push } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import { links } from "../../demos/routes.js";
import { skins } from "../../demos/skins.js";
import { links as localLinks } from "../routes.js";
import ListRoutes from "./ListRoutes.svelte";
import { Willow, WillowDark } from "../../src";
import { Globals, Locale, popupContainer } from "@svar-ui/svelte-core";

export default function Index($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defRoute = links[0][0].replace(/\/:skin$/, "/willow");

		const routes = {
			"/": wrap({
				component: {},
				conditions: () => {
					push(defRoute);

					return false;
				}
			}),

			"/routes": wrap({
				component: ListRoutes,
				props: { routes: links.filter(Array.isArray).map((x) => x[0]) }
			})
		};

		let skin = "willow";
		const skinSettings = {};

		function onRouteChange(path) {
			const parts = path.split("/");

			Object.assign(skinSettings, (skins.find((a) => a.id === parts[2]) || {}).props);
			skin = parts[2];
		}

		const allLinks = [...localLinks, ...links];

		allLinks.forEach((a) => {
			if (!Array.isArray(a)) return;

			const [path,, component] = a;

			routes[path] = wrap({
				component,
				userData: a,
				props: { skinSettings },
				conditions: (x) => {
					onRouteChange(x.location);

					return true;
				}
			});
		});

		Willow($$renderer, {});
		$$renderer.push(`<!----> `);
		WillowDark($$renderer, {});
		$$renderer.push(`<!----> <div${$.attr_class(`wx-${$.stringify(skin || 'material')}-theme content`, 'svelte-1cj1c6c')}>`);

		Locale($$renderer, {
			children: ($$renderer) => {
				Globals($$renderer, {
					children: ($$renderer) => {
						Router($$renderer, { routes });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}