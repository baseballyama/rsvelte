import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext, onDestroy } from "svelte";
import { env } from "@svar-ui/lib-dom";

var root_1 = $.from_html(`<div class="wx-portal svelte-1kiw21a"><div><!></div></div>`);

export default function Portal($$anchor, $$props) {
	$.push($$props, true);

	let portal = null;
	let theme = $.prop($$props, 'theme', 15, "");
	let handlers = [];

	const mount = (h) => {
		if (handlers) handlers.push(h);
	};

	if (theme() === "") theme(getContext("wx-theme"));

	function getParentRoot(p) {
		const root = env.getTopNode(p);

		while (p !== root && !p.getAttribute("data-wx-portal-root")) {
			p = p.parentNode;
		}

		return p;
	}

	onMount(() => {
		let currentTarget = $$props.target || getParentRoot(portal);

		currentTarget.appendChild(portal);

		if (handlers) handlers.forEach((h) => h());
	});

	onDestroy(() => {
		if (portal && portal.parentNode) portal.parentNode.removeChild(portal);
	});

	var $$exports = { mount };
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({ mount }));
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => portal = $$value, () => portal);
	$.reset(div);
	$.template_effect(() => $.set_class(div_1, 1, `wx-${theme() ?? ''}-theme`, 'svelte-1kiw21a'));
	$.append($$anchor, div);

	return $.pop($$exports);
}