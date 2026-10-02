import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Hi.Input(node, {});

	var node_1 = $.sibling(node, 2);

	Hello.World.Input(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Hello._World123.Input(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	hi.input(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	hello.world.input(node_4, {});

	var node_5 = $.sibling(node_4, 2);

	hello._world123.input(node_5, {});
	$.append($$anchor, fragment);
}