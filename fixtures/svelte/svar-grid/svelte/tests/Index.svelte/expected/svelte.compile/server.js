import * as $ from 'svelte/internal/server';
import Router, { push } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import { links } from "../demos/routes.js";
import { links as localLinks } from "./routes.js";

import {
	Material,
	Willow,
	WillowDark,
	Globals,
	Locale,
	popupContainer
} from "@svar-ui/svelte-core";

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
			})
		};

		let skin = "willow";

		function onRouteChange(path) {
			const parts = path.split("/");

			skin = parts[2];
		}

		const allLinks = [...localLinks, ...links];

		allLinks.forEach((a) => {
			if (!Array.isArray(a)) return;

			const [path,, component] = a;

			routes[path] = wrap({
				component,
				userData: a,
				conditions: (x) => {
					onRouteChange(x.location);

					return true;
				}
			});
		});

		Willow($$renderer, {});
		$$renderer.push(`<!----> `);
		WillowDark($$renderer, {});
		$$renderer.push(`<!----> `);
		Material($$renderer, {});
		$$renderer.push(`<!----> <div${$.attr_class(`wx-${$.stringify(skin)}-theme content`, 'svelte-1uq20qa')}>`);

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