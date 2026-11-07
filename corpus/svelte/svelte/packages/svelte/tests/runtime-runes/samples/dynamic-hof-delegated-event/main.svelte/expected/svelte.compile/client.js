import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>A</button> <button>B</button> <br/> <button>change</button>`, 1);

export default function Main($$anchor) {
	let hof = $.state((name) => () => console.log('A' + name));
	const member = $.derived(() => ({ hof: $.get(hof) }));

	function change() {
		$.set(hof, (name) => () => console.log('B' + name));
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var event_handler = $.derived(() => $.get(hof)('A'));
	var button_1 = $.sibling(button, 2);
	var event_handler_1 = $.derived(() => $.get(member).hof('B'));
	var button_2 = $.sibling(button_1, 4);

	$.delegated('click', button, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.delegated('click', button_1, function (...$$args) {
		$.get(event_handler_1)?.apply(this, $$args);
	});

	$.delegated('click', button_2, change);
	$.append($$anchor, fragment);
}

$.delegate(['click']);