import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

export default function Main($$anchor) {
	let shown = false;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var text = $.text('Nothing');

			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => Component, ($$anchor, $$component) => {
				$$component($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (shown) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}