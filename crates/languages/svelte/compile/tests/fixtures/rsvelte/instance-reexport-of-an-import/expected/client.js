import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { helper } from "./helper.js";
var root = $.from_html(`<span> </span>`);
export default function Instance_reexport_of_an_import($$anchor, $$props) {
	$.push($$props, true);
	const label = helper();
	var $$exports = {
		helper,
		alias: helper
	};
	var span = root();
	var text = $.only_child(span, true);
	$.template_effect(() => $.set_text(text, label));
	$.append($$anchor, span);
	return $.pop($$exports);
}
