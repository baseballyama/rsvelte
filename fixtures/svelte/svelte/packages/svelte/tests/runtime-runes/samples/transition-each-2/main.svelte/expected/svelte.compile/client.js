import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<li> </li>`);
var root_1 = $.from_html(`<button>Push</button> <button>Remove</button> <ul></ul>`, 1);

export default function Main($$anchor) {
	function foo(node, params) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.foo = t;
			}
		};
	}

	let list = $.state($.proxy([]));
	let id = 0;

	function push() {
		$.get(list).push({ id: id++ });
	}

	function remove() {
		$.set(list, [], true);
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var ul = $.sibling(button_1, 2);

	$.each(ul, 21, () => $.get(list), (item) => item.id, ($$anchor, item) => {
		var li = root();
		var text = $.only_child(li, true);

		$.template_effect(() => $.set_text(text, $.get(item).id));
		$.transition(2, li, () => foo);
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.delegated('click', button, push);
	$.delegated('click', button_1, remove);
	$.append($$anchor, fragment);
}

$.delegate(['click']);