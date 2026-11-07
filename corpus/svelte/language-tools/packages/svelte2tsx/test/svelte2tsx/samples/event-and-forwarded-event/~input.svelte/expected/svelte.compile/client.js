import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from "svelte";

var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const dispatch = createEventDispatcher();

	dispatch("mount", { input });

	var input_1 = root();

	$.event('focus', input_1, function ($$arg) {
		$.bubble_event.call(this, $$props, $$arg);
	});

	$.append($$anchor, input_1);
	$.pop();
}