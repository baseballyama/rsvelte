import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p>hello</p>`);
var root_1 = $.from_html(`<button>toggle x</button> <button>toggle y</button> <!>`, 1);

export default function Main($$anchor) {
	function foo(node) {
		return {
			duration: 100,
			tick: (t, u) => {
				node.setAttribute('foo', t);
			}
		};
	}

	let x = $.state(true);
	let y = $.state(true);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node_1 = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			$.transition(3, p, () => foo);
			$.append($$anchor, p);
		};

		$.if(node_1, ($$render) => {
			if ($.get(x) && $.get(y)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => {
		$.set(x, !$.get(x));
	});

	$.delegated('click', button_1, () => {
		$.set(y, !$.get(y));
	});

	$.append($$anchor, fragment);
}

$.delegate(['click']);