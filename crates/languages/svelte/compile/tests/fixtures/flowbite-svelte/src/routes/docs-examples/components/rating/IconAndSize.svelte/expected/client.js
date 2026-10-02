import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Rating, Heart } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function IconAndSize($$anchor, $$props) {
	$.push($$props, true);

	const heartWrapper = (props) => (anchor, _props) => Heart(anchor, { ..._props, ...props });
	var fragment = root();
	var node = $.first_child(fragment);

	Rating(node, {
		total: 5,
		rating: 3.3,
		size: 20,
		id: 'example-5',
		get icon() {
			return Heart;
		}
	});

	var node_1 = $.sibling(node, 2);

	Rating(node_1, {
		total: 10,
		rating: 7.6,
		id: 'example-5b',
		get icon() {
			return Heart;
		}
	});

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => heartWrapper({ fillColor: "#3752d6", strokeColor: "#3752d6" }));

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