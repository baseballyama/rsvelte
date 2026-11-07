import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "$lib/button/button.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children']);

export default function Action($$anchor, $$props) {
	let rest = $.rest_props($$props, rest_excludes);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Button($$anchor, $.spread_props(() => rest, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			}));
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
}