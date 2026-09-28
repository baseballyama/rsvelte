import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.from_html(`<ul><li><a href="/routing/trailing-slash-server/always">/always</a></li> <li><a href="/routing/trailing-slash-server/ignore">/ignore</a></li> <li><a href="/routing/trailing-slash-server/ignore/">/ignore/</a></li> <li><a href="/routing/trailing-slash-server/never/">/never/</a></li></ul> <p data-test-id="pathname-store"> </p> <p data-test-id="pathname-data"> </p> <!>`, 1);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p, true);
	var p_1 = $.sibling(p, 2);
	var text_1 = $.only_child(p_1, true);
	var node = $.sibling(p_1, 2);

	$.snippet(node, () => $$props.children);

	$.template_effect(() => {
		$.set_text(text, page.url.pathname);
		$.set_text(text_1, $$props.data.pathname);
	});

	$.append($$anchor, fragment);
	$.pop();
}