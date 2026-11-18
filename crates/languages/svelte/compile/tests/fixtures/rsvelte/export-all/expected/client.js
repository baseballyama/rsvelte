import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
import { x } from "m";
export default function Export_all($$anchor) {
	let y = 1;
	$.next();
	var text = $.text();
	$.template_effect(() => $.set_text(text, `1${x ?? ""}`));
	$.append($$anchor, text);
}
