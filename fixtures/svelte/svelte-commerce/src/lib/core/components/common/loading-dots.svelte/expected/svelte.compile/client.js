import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span><span class="dot svelte-1i86j2l"></span> <span class="dot svelte-1i86j2l"></span> <span class="dot svelte-1i86j2l"></span></span>`);

export default function Loading_dots($$anchor) {
	const visible = true;
	var span = root();

	$.set_class(span, 1, 'loading-dots svelte-1i86j2l', null, {}, { visible });
	$.append($$anchor, span);
}