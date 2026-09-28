import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button> <!>`, 1);

export default function Main($$anchor) {
	let count = $.state(0);

	function listen(node) {
		function handler() {
			$.update(count);
		}

		node.addEventListener("click", handler);

		return {
			destroy() {
				node.removeEventListener("click", handler);
			}
		};
	}

	var fragment = root();
	var button = $.first_child(fragment);

	$.action(button, ($$node) => listen?.($$node));

	var node_1 = $.sibling(button, 2);

	$.await(node_1, () => Promise.resolve(), null, ($$anchor) => {
		var text = $.text();

		text.nodeValue = err.or;
		$.append($$anchor, text);
	});

	$.append($$anchor, fragment);
}