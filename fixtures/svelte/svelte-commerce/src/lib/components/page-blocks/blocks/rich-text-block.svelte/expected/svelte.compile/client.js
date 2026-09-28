import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="w-full"></div>`);

export default function Rich_text_block($$anchor, $$props) {
	$.push($$props, true);

	var div = root();

	$.html(div, () => $$props.block.metadata.html, true);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}