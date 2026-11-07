import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<page><label class="info" horizontalalignment="center" verticalalignment="center" textwrap="true"><formattedstring><span class="fas" text=""></span> <span></span></formattedstring></label> <div asd=""></div></page>`);

export default function Input($$anchor) {
	let message = "Blank Svelte Native App";
	var page = root();
	var label = $.child(page);
	var formattedString = $.child(label);
	var span = $.sibling($.child(formattedString), 2);

	$.set_attribute(span, 'text', ' Blank Svelte Native App');
	$.reset(formattedString);
	$.reset(label);
	$.next(2);
	$.reset(page);
	$.append($$anchor, page);
}