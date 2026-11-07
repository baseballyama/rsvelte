import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><button>click me</button></div>`);

export default function Main($$anchor) {
	let toggle = $.state(false);

	const onclick = $.derived(() => $.get(toggle)
		? () => {
			console.log('works');
		}
		: () => {
			console.log('fails');
		});

	const props = $.derived(() => ({ onclick: $.get(onclick) }));
	var div = root();

	$.attribute_effect(div, () => ({ ...$.get(props) }));

	var button = $.only_child(div);

	$.delegated('click', button, () => {
		$.set(toggle, true);
	});

	$.append($$anchor, div);
}

$.delegate(['click']);