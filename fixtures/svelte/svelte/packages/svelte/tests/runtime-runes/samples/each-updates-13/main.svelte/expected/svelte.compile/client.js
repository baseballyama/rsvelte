import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span> </span>`);
var root_1 = $.from_html(`<button>clear</button> <button>reverse</button> <!>`, 1);

export default function Main($$anchor) {
	function fade(node) {
		return {
			duration: 1000,
			tick(t) {
				node.style.opacity = t;
			}
		};
	}

	let items = $.state($.proxy(['a', 'b', 'c']));
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node_1 = $.sibling(button_1, 2);

	$.each(node_1, 16, () => $.get(items), (item) => item, ($$anchor, item) => {
		var span = root();
		var text = $.only_child(span, true);

		$.template_effect(() => $.set_text(text, item));
		$.transition(3, span, () => fade, () => ({ duration: 1000 }));
		$.append($$anchor, span);
	});

	$.delegated('click', button, () => $.set(items, [], true));
	$.delegated('click', button_1, () => $.set(items, ['c', 'b', 'a'], true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);