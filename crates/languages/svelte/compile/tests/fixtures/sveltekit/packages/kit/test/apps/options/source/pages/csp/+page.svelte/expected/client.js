import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';

var root = $.with_script($.from_html(`<script></script><!>`, 1));

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	$.head('8xqtbk', ($$anchor) => {
		var fragment = root();
		var script = $.first_child(fragment);
		var node = $.sibling(script);

		$.template_effect(($0) => $.set_attribute(script, 'src', `http://localhost:${$0 ?? ''}/blocked.js`), [() => page.url.searchParams.get('port')]);
		$.append($$anchor, fragment);
	});

	$.pop();
}