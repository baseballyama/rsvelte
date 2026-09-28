import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let Content = $.derived(() => $$props.data.content);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(Content), ($$anchor, Content_1) => {
		Content_1($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}