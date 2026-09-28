import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>person.name.first = "dave"</button>`);
var root_1 = $.from_html(`<div> </div>`);
var root_2 = $.from_html(`<!> <h3>JSON output</h3> <!>`, 1);

export default function Main($$anchor) {
	let people = $.state($.proxy([{ name: { first: 'rob' } }]));
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.each(node, 17, () => $.get(people), $.index, ($$anchor, person, $$index) => {
		var button = root();

		$.event('click', button, () => {
			($.get(person).name.first = "dave");
			$.set(people, $.get(people), true);
		});

		$.append($$anchor, button);
	});

	var node_1 = $.sibling(node, 4);

	$.each(node_1, 17, () => $.get(people), $.index, ($$anchor, person) => {
		var div = root_1();
		var text = $.only_child(div, true);

		$.template_effect(($0) => $.set_text(text, $0), [() => JSON.stringify($.get(people))]);
		$.append($$anchor, div);
	});

	$.append($$anchor, fragment);
}