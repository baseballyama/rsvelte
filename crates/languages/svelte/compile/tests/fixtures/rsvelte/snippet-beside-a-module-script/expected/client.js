import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import { tick } from "svelte";
import * as $ from "svelte/internal/client";
export const row = 1;
var root = $.from_html(`<b> </b>`);
export default function Snippet_beside_a_module_script($$anchor) {
	const row = ($$anchor) => {
		var b = root();
		var text = $.only_child(b, true);
		$.template_effect(() => $.set_text(text, tick));
		$.append($$anchor, b);
	};
	row($$anchor);
}
