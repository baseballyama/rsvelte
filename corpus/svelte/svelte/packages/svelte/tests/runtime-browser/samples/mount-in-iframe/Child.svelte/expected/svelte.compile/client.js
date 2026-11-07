import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GrandChild from "./GrandChild.svelte";

var root = $.from_html(`<h1 class="svelte-xpqyuz"> </h1> <!>`, 1);
const $$css = { hash: 'svelte-xpqyuz', code: 'h1.svelte-xpqyuz {color:red;}' };

export default function Child($$anchor, $$props) {
	$.append_styles($$anchor, $$css);

	var fragment = root();
	var h1 = $.first_child(fragment);
	var text = $.only_child(h1);
	var node = $.sibling(h1, 2);

	GrandChild(node, {
		get count() {
			return $$props.count;
		}
	});

	$.template_effect(() => $.set_text(text, `count: ${$$props.count ?? ''}`));
	$.append($$anchor, fragment);
}