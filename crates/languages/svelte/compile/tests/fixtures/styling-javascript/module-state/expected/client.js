import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

let value = $.state("a");

export function set(next) {
	$.set(value, next, true);
}

export function get() {
	return $.get(value);
}

var root = $.from_html(`<p></p>`);

export default function Module_state($$anchor) {
	var p = root();
	$.template_effect(($0) => $.set_class(p, 1, $0, 'svelte-1xipmll'), [() => $.clsx(get())]);
	$.append($$anchor, p);
}
