import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Rating, Thumbup } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function IconAndSize2($$anchor, $$props) {
	$.push($$props, true);

	const thumbWrapper = (props) => (anchor, _props) => Thumbup(anchor, { ..._props, ...props });
	var fragment = root();
	var node = $.first_child(fragment);

	Rating(node, {
		total: 5,
		rating: 4.7,
		size: 20,
		id: 'example-5d',
		get icon() {
			return Thumbup;
		}
	});

	var node_1 = $.sibling(node, 2);

	Rating(node_1, {
		total: 10,
		rating: 8.2,
		id: 'example-5e',
		get icon() {
			return Thumbup;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => thumbWrapper({ fillColor: "#ff3f00", strokeColor: "#ff3f00" }));

		Rating(node_2, {
			total: 10,
			rating: 7.6,
			id: 'example-5b',
			get icon() {
				return $.get($0);
			}
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}