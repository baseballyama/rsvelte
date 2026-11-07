import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button></button>`);

export default function Modifier_input($$anchor, $$props) {
	var button = root();

	$.event('click', button, $.once(function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	}));

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('click', button, $.self(function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	}));

	$.event(
		'click',
		button,
		function ($$arg) {
			$.bubble_event.call(this, $$props, $$arg);
		},
		true
	);

	$.event('click', button, $.self($.stopPropagation(function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	})));

	$.append($$anchor, button);
}