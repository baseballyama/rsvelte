import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="text-muted-foreground flex flex-col gap-1.5 text-center text-xs md:text-right"><!></div>`);

export default function Demo_note($$anchor, $$props) {
	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
}