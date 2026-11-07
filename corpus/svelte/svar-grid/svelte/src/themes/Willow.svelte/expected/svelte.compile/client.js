import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Willow } from "@svar-ui/svelte-core";

export default function Willow_1($$anchor, $$props) {
	let fonts = $.prop($$props, 'fonts', 3, true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Willow($$anchor, {
				get fonts() {
					return fonts();
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node_1 = $.first_child(fragment_2);

					$.snippet(node_1, () => $$props.children);
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			Willow($$anchor, {
				get fonts() {
					return fonts();
				}
			});
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
}