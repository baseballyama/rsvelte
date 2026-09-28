import * as $ from 'svelte/internal/server';
import { onMount, getContext, onDestroy } from "svelte";
import { env } from "@svar-ui/lib-dom";

export default function Portal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let portal = null;
		let { theme = "", target, children } = $$props;
		let handlers = [];

		const mount = (h) => {
			if (handlers) handlers.push(h);
		};

		if (theme === "") theme = getContext("wx-theme");

		function getParentRoot(p) {
			const root = env.getTopNode(p);

			while (p !== root && !p.getAttribute("data-wx-portal-root")) {
				p = p.parentNode;
			}

			return p;
		}

		onMount(() => {
			let currentTarget = target || getParentRoot(portal);

			currentTarget.appendChild(portal);

			if (handlers) handlers.forEach((h) => h());
		});

		onDestroy(() => {
			if (portal && portal.parentNode) portal.parentNode.removeChild(portal);
		});

		$$renderer.push(`<div class="wx-portal svelte-1kiw21a"><div${$.attr_class(`wx-${$.stringify(theme)}-theme`, 'svelte-1kiw21a')}>`);
		children?.($$renderer, { mount });
		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { theme, mount });
	});
}