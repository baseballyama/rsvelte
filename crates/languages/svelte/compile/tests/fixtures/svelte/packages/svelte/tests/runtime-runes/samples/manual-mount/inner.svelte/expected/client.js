import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createEventDispatcher, getContext } from "svelte";

var root = $.from_html(`<button> </button>`);

export default function Inner($$anchor, $$props) {
	$.push($$props, true);

	const multiply = getContext('multiply');

	// Use legacy createEventDispatcher here to test that `events` property in `mount` works
	const dispatch = createEventDispatcher();

	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $$props.count));
	$.delegated('click', button, () => dispatch('update', $$props.count + 1 * multiply));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);