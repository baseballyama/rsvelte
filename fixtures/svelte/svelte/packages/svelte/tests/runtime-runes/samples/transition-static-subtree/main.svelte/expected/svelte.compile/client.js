import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><span>123</span></div>`);
var root_1 = $.from_html(`<button>Toggle</button> <!>`, 1);

export default function Main($$anchor) {
	function fade(_) {
		return { duration: 500, css: (t) => `opacity: ${t}` };
	}

	let visible = $.state(true);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var span = $.only_child(div);

			$.transition(3, span, () => fade);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(visible)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(visible, !$.get(visible)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);