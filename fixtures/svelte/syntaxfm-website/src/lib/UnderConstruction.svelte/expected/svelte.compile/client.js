import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import underConstruction from '$assets/under-construction.gif';

var root = $.from_html(`<div class="svelte-w4jcb2"><img alt="Cute lil digger on a under construction sign" class="svelte-w4jcb2"/> <p class="svelte-w4jcb2">New site, mind the dust! Please <a href="https://github.com/syntaxfm/website/issues">log any issues or suggestions</a></p></div>`);

export default function UnderConstruction($$anchor) {
	var div = root();
	var img = $.child(div);

	$.next(2);
	$.reset(div);
	$.template_effect(() => $.set_attribute(img, 'src', underConstruction));
	$.append($$anchor, div);
}