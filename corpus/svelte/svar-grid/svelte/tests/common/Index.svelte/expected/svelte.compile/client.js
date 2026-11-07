import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Router, { push } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import { links } from "../../demos/routes.js";
import { skins } from "../../demos/skins.js";
import { links as localLinks } from "../routes.js";
import ListRoutes from "./ListRoutes.svelte";
import { Willow, WillowDark } from "../../src";
import { Globals, Locale, popupContainer } from "@svar-ui/svelte-core";

var root = $.from_html(`<!> <!> <div><!></div>`, 1);

export default function Index($$anchor, $$props) {
	$.push($$props, true);

	const defRoute = links[0][0].replace(/\/:skin$/, "/willow");

	const routes = $.proxy({
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
	});

	let skin = $.state("willow");
	const skinSettings = {};

	function onRouteChange(path) {
		const parts = path.split("/");

		Object.assign(skinSettings, (skins.find((a) => a.id === parts[2]) || {}).props);
		$.set(skin, parts[2], true);
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

	var fragment = root();
	var node = $.first_child(fragment);

	Willow(node, {});

	var node_1 = $.sibling(node, 2);

	WillowDark(node_1, {});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	Locale(node_2, {
		children: ($$anchor, $$slotProps) => {
			Globals($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Router($$anchor, {
						get routes() {
							return routes;
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.action(div, ($$node) => popupContainer?.($$node));
	$.template_effect(() => $.set_class(div, 1, `wx-${($.get(skin) || 'material') ?? ''}-theme content`, 'svelte-1cj1c6c'));
	$.append($$anchor, fragment);
	$.pop();
}