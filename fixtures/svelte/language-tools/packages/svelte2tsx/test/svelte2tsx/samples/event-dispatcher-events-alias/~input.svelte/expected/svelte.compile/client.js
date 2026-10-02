import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher as foo, abc } from "svelte";

var root = $.from_html(`<button></button>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const notDispatch = abc();
	const dispatch = foo();

	dispatch('hi', true);

	function bye() {
		const bla = 'bye';

		dispatch(bla, false);
	}

	var button = root();

	$.event('click', button, () => dispatch('btn', ''));
	$.append($$anchor, button);
	$.pop();
}