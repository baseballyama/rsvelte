import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var rest_excludes = new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	7,
	"8",
	1.5,
	"a"
]);
export default function Rest_props_numeric_key($$anchor, $$props) {
	$.push($$props, true);
	let rest = $.rest_props($$props, rest_excludes);
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, `${$$props["7"] ?? ""} ${$$props["8"] ?? ""} ${$$props["1.5"] ?? ""} ${$$props.a ?? ""} ${$$props.b ?? ""}`));
	$.append($$anchor, text);
	$.pop();
}
