import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<p>x</p>`);
export default function Legacy_export($$anchor, $$props) {
	$.push($$props, true);
	function api() {}
	var $$exports = { api };
	var p = root();
	$.append($$anchor, p);
	return $.pop($$exports);
}
