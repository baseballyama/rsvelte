import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fly } from 'svelte/transition';

var root = $.from_html(`<div>hello</div>`);

export default function Child($$anchor) {
	// Not read before the outro, by which time the derived is destroyed
	let duration = $.derived(() => 10);

	var div = root();

	$.transition(1, div, () => fly, () => ({ duration: 10 }));
	$.transition(2, div, () => fly, () => ({ duration: $.get(duration) }));
	$.append($$anchor, div);
}