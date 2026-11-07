import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const Markdown = $.derived(() => $$props.data.doc.component);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(Markdown), ($$anchor, Markdown_1) => {
		Markdown_1($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}