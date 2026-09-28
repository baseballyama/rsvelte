import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';

var root = $.from_html(`<h1></h1>`);
var root_1 = $.from_html(`<button>show</button><button>animate</button> <!>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let show = $.state(false);
	let animate = $.state(false);

	function maybe(node, animate) {
		if (animate) return fade(node);
	}

	var fragment = root_1();
	var button = $.first_child(fragment);
	var button_1 = $.sibling(button);
	var node_1 = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var h1 = root();

			h1.textContent = `Hello ${name ?? ''}!`;
			$.transition(3, h1, () => maybe, () => $.get(animate));
			$.append($$anchor, h1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(show)) $$render(consequent);
		});
	}

	$.delegated('click', button, () => $.set(show, !$.get(show)));
	$.delegated('click', button_1, () => $.set(animate, !$.get(animate)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);