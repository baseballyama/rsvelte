import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createPageTitle } from '$doclib/util.js';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const title = $.derived(() => $$props.data.meta?.title?.[1]);
	var fragment = $.comment();

	$.head('1dqm967', ($$anchor) => {
		$.deferred_template_effect(
			($0) => {
				$.document.title = $0 ?? '';
			},
			[
				() => createPageTitle($.get(title) ? `fn ${$.get(title)}()` : 'Function')
			]
		);
	});

	var node = $.first_child(fragment);

	$.component(node, () => $$props.data.content, ($$anchor, data_content) => {
		data_content($$anchor, {});
	});

	$.append($$anchor, fragment);
	$.pop();
}