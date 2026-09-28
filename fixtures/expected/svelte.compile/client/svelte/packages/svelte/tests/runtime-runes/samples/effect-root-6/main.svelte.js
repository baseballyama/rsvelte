import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from "./Child.svelte";

var root = $.from_html(`<button>hide</button> <button>increment</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(true);
	let child = $.state(void 0);
	let increment;

	$.user_effect(() => {
		if ($.get(child)) increment = $.get(child).increment;
	});

	var fragment = root();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button, 2);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			$.bind_this(Child($$anchor, {}), ($$value) => $.set(child, $$value, true), () => $.get(child));
		};

		$.if(node, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, false));
	$.delegated('click', button_1, () => increment());
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);