import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<main class="bg-background text-foreground flex h-screen flex-col"><!> <!> <!></main>`);

export default function MainLayout($$anchor, $$props) {
	var main = root();
	var node = $.child(main);

	$.snippet(node, () => $$props.header);

	var node_1 = $.sibling(node, 2);

	$.snippet(node_1, () => $$props.content);

	var node_2 = $.sibling(node_1, 2);

	$.snippet(node_2, () => $$props.footer);
	$.reset(main);
	$.append($$anchor, main);
}