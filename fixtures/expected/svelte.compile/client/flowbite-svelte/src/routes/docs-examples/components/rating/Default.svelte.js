import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Rating, Star } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor, $$props) {
	$.push($$props, true);

	const wrapper = (props) => (anchor, _props) => Star(anchor, { ..._props, ...props });
	var fragment = root();
	var node = $.first_child(fragment);

	Rating(node, { id: 'example-1', total: 5, size: 50, rating: 1.4 });

	var node_1 = $.sibling(node, 2);

	Rating(node_1, { id: 'example-1b', total: 5, size: 50, rating: 4.66 });

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => wrapper({ fillColor: "#008800", strokeColor: "#008800" }));

		Rating(node_2, {
			id: 'example-1b',
			get icon() {
				return $.get($0);
			},
			total: 5,
			size: 50,
			rating: 4.66
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}