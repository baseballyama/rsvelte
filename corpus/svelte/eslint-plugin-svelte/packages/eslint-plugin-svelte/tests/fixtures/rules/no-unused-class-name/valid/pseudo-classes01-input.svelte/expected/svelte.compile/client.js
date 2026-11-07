import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="div-class svelte-1aw36bp">Hello</div> <span class="span-class-one svelte-1aw36bp">World</span> <span class="span-class-two svelte-1aw36bp">!</span>`, 1);

export default function Pseudo_classes01_input($$anchor) {
	var fragment = root();

	$.next(4);
	$.append($$anchor, fragment);
}