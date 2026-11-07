import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>clicks</div>`);
var root_1 = $.from_html(`<button>Toggle</button> <!>`, 1);

export default function Main($$anchor) {
	let visible = $.state(0);

	function customTransition() {
		console.log($.effect_tracking());
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(3, div, () => customTransition);
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