import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher, abc } from "svelte";

var root = $.from_html(`<button></button>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const notDispatch = abc();
	const dispatch1 = createEventDispatcher();
	const dispatch2 = createEventDispatcher();

	dispatch1('hi', true);
	dispatch2('bye', true);

	var button = root();

	$.event('click', button, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, button);
	$.pop();
}