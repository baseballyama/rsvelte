import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { longLongName2 } from './imported';

var root = $.from_html(`<!> <!>}`, 1);

export default function Workspace_symbols($$anchor) {
	function longLongName() {}

	var fragment = root();
	var node = $.first_child(fragment);

	Component(node, {});

	var node_1 = $.sibling(node, 2);

	$.each(node_1, 16, () => [''], $.index, ($$anchor, longLongName4) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, longLongName4));
		$.append($$anchor, text);
	});

	$.next();
	$.append($$anchor, fragment);
}