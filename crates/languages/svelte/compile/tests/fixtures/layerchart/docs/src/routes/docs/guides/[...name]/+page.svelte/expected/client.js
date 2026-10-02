import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const PageComponent = $.derived(() => $$props.data.PageComponent);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $.get(PageComponent), ($$anchor, PageComponent_1) => {
		PageComponent_1($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}