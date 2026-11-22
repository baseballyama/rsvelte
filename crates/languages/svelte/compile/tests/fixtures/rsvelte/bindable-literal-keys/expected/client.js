import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
export default function Bindable_literal_keys($$anchor, $$props) {
	$.push($$props, true);
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, `${$$props["10"] ?? ""}${$$props["16"] ?? ""}${$$props.s ?? ""}`));
	$.append($$anchor, text);
	$.pop();
}
