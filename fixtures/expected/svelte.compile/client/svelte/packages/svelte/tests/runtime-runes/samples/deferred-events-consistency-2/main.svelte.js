import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<form><button type="submit">Submit</button></form>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let action = $.state('old url');
	var form = root();
	var button = $.only_child(form);

	$.template_effect(() => $.set_attribute(form, 'action', $.get(action)));

	$.event('submit', form, function (event) {
		console.log(this.action);
		event.preventDefault();
	});

	$.delegated('click', button, () => {
		$.set(action, 'new url');
	});

	$.append($$anchor, form);
	$.pop();
}

$.delegate(['click']);