import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Rating, Star } from "flowbite-svelte";

var root = $.from_html(`<p class="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">3.4 out of 5</p>`);
var root_1 = $.from_html(`<p class="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">2.8 out of 5</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Text($$anchor, $$props) {
	$.push($$props, true);

	const wrapper = (props) => (anchor, _props) => Star(anchor, { ..._props, ...props });
	var fragment = root_2();
	var node = $.first_child(fragment);

	{
		const text = ($$anchor) => {
			var p = root();

			$.append($$anchor, p);
		};

		Rating(node, {
			id: 'example-3a',
			total: 5,
			rating: 3.4,
			text,
			$$slots: { text: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const text = ($$anchor) => {
			var p_1 = root_1();

			$.append($$anchor, p_1);
		};

		let $0 = $.derived(() => wrapper({ fillColor: "#008800", strokeColor: "#008800" }));

		Rating(node_1, {
			id: 'example-3',
			total: 5,
			rating: 2.8,
			get icon() {
				return $.get($0);
			},
			text,
			$$slots: { text: true }
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}