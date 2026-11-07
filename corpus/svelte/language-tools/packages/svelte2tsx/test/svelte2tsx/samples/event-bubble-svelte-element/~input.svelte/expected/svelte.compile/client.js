import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.event('click', $.document.body, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.event('resize', $.window, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});
}