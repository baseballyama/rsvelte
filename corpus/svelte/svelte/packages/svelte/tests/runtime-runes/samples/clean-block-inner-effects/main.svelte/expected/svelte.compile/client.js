import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button></button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let count = $.state(1);

	function track(value) {
		let val = value;

		$.user_effect(() => {
			console.log("effect", val);

			return () => {
				console.log("clean", val);
			};
		});

		return value;
	}

	var fragment = root();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {};
		var d = $.derived(() => track($.get(count)));

		$.if(node, ($$render) => {
			if ($.get(d)) $$render(consequent);
		});
	}

	var button = $.sibling(node, 2);

	$.delegated('click', button, () => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);