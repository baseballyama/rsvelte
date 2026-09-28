import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Foo from './Foo.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<button>toggle</button> <!>`, 1);

export default function Main($$anchor) {
	const Comp = { Foo };
	let visible = $.state(false);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Foo(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Comp.Foo, ($$anchor, Comp_Foo) => {
				Comp_Foo($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(visible, !$.get(visible)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);