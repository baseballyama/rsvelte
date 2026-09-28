import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

var root = $.from_html(`<button>toggle</button> <h1> </h1> <!> <!> <!> <!>`, 1);

export default function Main($$anchor) {
	const id = $.props_id();
	let show = $.state(false);
	var fragment = root();
	var button = $.first_child(fragment);
	var h1 = $.sibling(button, 2);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	Child(node, {});

	var node_1 = $.sibling(node, 2);

	Child(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Child(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent = ($$anchor) => {
			Child($$anchor, {});
		};

		$.if(node_3, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_text(text, id));
	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);