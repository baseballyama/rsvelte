import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h3 class="px-4 pt-2.5 pb-1 text-xs font-semibold text-gray-500 uppercase"> </h3>`);

export default function ListSection($$anchor, $$props) {
	$.push($$props, true);

	var h3 = root();
	var text = $.only_child(h3, true);

	$.template_effect(() => $.set_text(text, $$props.props.title));
	$.append($$anchor, h3);
	$.pop();
}