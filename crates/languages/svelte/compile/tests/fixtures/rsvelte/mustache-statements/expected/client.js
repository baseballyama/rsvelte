import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Mustache_statements($$anchor, $$props) {
	$.push($$props, true);
	let a = 1;
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, `${{ a: 1 } ?? ""}
${{ a }.a ?? ""}
${(a, a) ?? ""}
${function() {}}`));
	$.append($$anchor, text);
	$.pop();
}
