import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Router, { push } from "svelte-spa-router";
import { wrap } from "svelte-spa-router/wrap";
import { links } from "../demos/routes.js";
import { links as localLinks } from "./routes.js";
import { Material, Willow, WillowDark, Globals, popupContainer } from "@svar-ui/svelte-core";

var root = $.from_html(`<!> <!> <!> <div><!></div>`, 1);

export default function Index($$anchor, $$props) {
	$.push($$props, true);

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

	let skin = $.state("willow");

	function onRouteChange(path) {
		const parts = path.split("/");

		$.set(skin, parts[2], true);
	}

	const allLinks = [...localLinks, ...links];

	allLinks.forEach((a) => {
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

	var fragment = root();
	var node = $.first_child(fragment);

	Willow(node, {});

	var node_1 = $.sibling(node, 2);

	WillowDark(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Material(node_2, {});

	var div = $.sibling(node_2, 2);
	var node_3 = $.child(div);

	Globals(node_3, {
		children: ($$anchor, $$slotProps) => {
			Router($$anchor, {
				get routes() {
					return routes;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.action(div, ($$node) => popupContainer?.($$node));
	$.template_effect(() => $.set_class(div, 1, `wx-${$.get(skin) ?? ''}-theme content`, 'svelte-1uq20qa'));
	$.append($$anchor, fragment);
	$.pop();
}