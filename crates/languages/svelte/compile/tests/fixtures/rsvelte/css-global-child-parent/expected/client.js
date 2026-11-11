import "svelte/internal/disclose-version";
import * as $ from "svelte/internal/client";
var root = $.from_html(`<div class="svelte-1u8jj3x"><div></div></div> <article><p>b</p></article>`, 1);
export default function Css_global_child_parent($$anchor) {
	var fragment = root();
	$.next(2);
	$.append($$anchor, fragment);
}
