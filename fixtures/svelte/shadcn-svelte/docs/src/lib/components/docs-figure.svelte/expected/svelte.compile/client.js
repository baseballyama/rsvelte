import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<figure class="mt-6 flex flex-col gap-4"><!> <figcaption class="text-center text-sm text-gray-500"> </figcaption></figure>`);

export default function Docs_figure($$anchor, $$props) {
	var figure = root();
	var node = $.child(figure);

	$.snippet(node, () => $$props.children ?? $.noop);

	var figcaption = $.sibling(node, 2);
	var text = $.only_child(figcaption, true);

	$.reset(figure);
	$.template_effect(() => $.set_text(text, $$props.caption));
	$.append($$anchor, figure);
}