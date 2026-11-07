import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button>`);

export default function Comments_in_tags01_input($$anchor) {
	var button = root();

	$.delegated('click', button, doTheThing);
	$.append($$anchor, button);
}

$.delegate(['click']);