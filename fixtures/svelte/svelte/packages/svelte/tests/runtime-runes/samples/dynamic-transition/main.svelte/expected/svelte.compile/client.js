import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<button> </button> <button> </button> <!>`, 1);

export default function Main($$anchor) {
	function transition1() {
		console.log('transition 1');

		return { tick() {} };
	}

	function transition2() {
		console.log('transition 2');

		return { tick() {} };
	}

	let toggle = $.state(false);
	let toggleTransition = $.state(false);
	const derived = $.derived(() => $.get(toggleTransition) ? transition1 : transition2);
	var fragment = root_1();
	var button = $.first_child(fragment);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	var text_1 = $.only_child(button_1, true);
	var node = $.sibling(button_1, 2);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.transition(3, div, () => $.get(derived));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(toggle)) $$render(consequent);
		});
	}

	$.template_effect(() => {
		$.set_text(text, $.get(toggle));
		$.set_text(text_1, $.get(toggleTransition));
	});

	$.event('click', button, () => $.set(toggle, !$.get(toggle)));
	$.event('click', button_1, () => $.set(toggleTransition, !$.get(toggleTransition)));
	$.append($$anchor, fragment);
}