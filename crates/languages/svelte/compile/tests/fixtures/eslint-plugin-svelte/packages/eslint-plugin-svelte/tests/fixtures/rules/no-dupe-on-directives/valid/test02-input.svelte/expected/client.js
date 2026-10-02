import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Test02_input($$anchor, $$props) {
	var button = root();

	$.event('focus', button, $.once(function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	}));

	$.event('focus', button, (evt) => console.log(evt));
	$.event('keydown', button, () => console.log('foo'));
	$.event('keydown', button, (evt) => console.log(evt));
	$.append($$anchor, button);
}