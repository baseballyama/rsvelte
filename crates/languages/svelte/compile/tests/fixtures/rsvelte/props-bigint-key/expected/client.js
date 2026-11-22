import "svelte/internal/init-operations";
import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	10n,
	0n
]);
export default function Props_bigint_key($$anchor, $$props) {
	$.push($$props, true);
	let ten = $.prop($$props, 10n, 15), rest = $.rest_props($$props, rest_excludes);
	ten(1);
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, `${ten() ?? ""}${$$props["0"] ?? ""}${$$props.x ?? ""}`));
	$.append($$anchor, text);
	$.pop();
}
