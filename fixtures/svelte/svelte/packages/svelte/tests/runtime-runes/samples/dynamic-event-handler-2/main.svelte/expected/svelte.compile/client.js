import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>Tama</button> <button>Pochi</button> <br/> <button>Change Function</button>`, 1);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let saySomething = $.state((name) => {
		console.log('creating "Hello" handler for ' + name);

		return { handler: () => console.log('Hello ' + name) };
	});

	function change() {
		$.set(saySomething, (name) => {
			console.log('creating "Bye" handler for ' + name);

			return { handler: () => console.log('Bye ' + name) };
		});
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var event_handler = $.derived(() => $.get(saySomething)('Tama').handler);
	var button_1 = $.sibling(button, 2);
	var event_handler_1 = $.derived(() => $.get(saySomething)('Pochi').handler);
	var button_2 = $.sibling(button_1, 4);

	$.event('click', button, function (...$$args) {
		$.get(event_handler)?.apply(this, $$args);
	});

	$.event('click', button_1, function (...$$args) {
		$.get(event_handler_1)?.apply(this, $$args);
	});

	$.event('click', button_2, change);
	$.append($$anchor, fragment);
	$.pop();
}