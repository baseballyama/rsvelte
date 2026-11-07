import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<span tabindex="0"><span class="element"></span></span>`);

export default function Element_ignore01_svelte4_input($$anchor) {
	var span = root();

	$.append($$anchor, span);
}