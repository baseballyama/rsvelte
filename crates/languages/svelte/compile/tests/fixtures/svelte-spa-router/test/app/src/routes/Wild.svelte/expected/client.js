import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2 class="routetitle">Wild</h2> <p> </p>`, 1);

export default function Wild($$anchor, $$props) {
	$.push($$props, true);

	let params = $.prop($$props, 'params', 19, () => ({}));
	var fragment = root();
	var p = $.sibling($.first_child(fragment), 2);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Your message is: ${params().wild ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}