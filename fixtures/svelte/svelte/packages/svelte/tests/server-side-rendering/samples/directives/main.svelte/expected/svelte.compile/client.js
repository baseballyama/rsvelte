import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button>click me</button>`);

export default function Main($$anchor) {
	var button = root();

	$.event('click', button, () => foo = "bar");
	$.append($$anchor, button);
}