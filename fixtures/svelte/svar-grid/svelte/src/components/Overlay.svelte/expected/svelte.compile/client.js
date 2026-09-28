import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";

var root = $.from_html(`<div class="wx-overlay svelte-abcd2c"><!></div>`);

export default function Overlay($$anchor, $$props) {
	$.push($$props, true);

	const api = getContext("grid-store");

	function isComponent(prop) {
		return typeof prop === "function";
	}

	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			const SvelteComponent = $.derived(() => $$props.overlay);
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_1) => {
				SvelteComponent_1($$anchor, { onaction: ({ action, data }) => api.exec(action, data) });
			});

			$.append($$anchor, fragment);
		};

		var d = $.derived(() => isComponent($$props.overlay));

		var alternate = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.overlay));
			$.append($$anchor, text);
		};

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}