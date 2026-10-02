import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from "./Component.svelte";

export default function Main($$anchor) {
	let condition = true;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Component($$anchor, {
				get condition() {
					return condition;
				},

				set condition($$value) {
					condition = $$value;
				}
			});
		};

		$.if(node, ($$render) => {
			if (condition) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}