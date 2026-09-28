import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function _page($$anchor, $$props) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => $$props.data.content, ($$anchor, data_content) => {
		data_content($$anchor, {});
	});

	$.append($$anchor, fragment);
}