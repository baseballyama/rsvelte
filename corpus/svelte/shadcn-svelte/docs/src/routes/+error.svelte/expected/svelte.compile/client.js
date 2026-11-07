import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { ModeWatcher } from "mode-watcher";

var root = $.from_html(`<!> <h1> </h1> <p> </p>`, 1);

export default function _error($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	ModeWatcher(node, {});

	var h1 = $.sibling(node, 2);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p, true);

	$.template_effect(() => {
		$.set_text(text, page.status);
		$.set_text(text_1, page.error?.message);
	});

	$.append($$anchor, fragment);
	$.pop();
}