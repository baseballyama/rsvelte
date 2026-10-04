import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

const value = "a";

export { value as name };

export { other } from "./other.js";

export * from "./x.js";

var root = $.from_html(`<p></p>`);

export default function Module_export($$anchor) {
	var p = root();
	$.set_class(p, 1, $.clsx(value), 'svelte-1smzd4s');
	$.append($$anchor, p);
}
