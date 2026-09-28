import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h2>Wildcard</h2> <p>Anything in the URL after <code>/wild/</code> is shown below as message. That's found in the <code>params.wild</code> prop.</p> <p> </p>`, 1);

export default function Wild($$anchor, $$props) {
	$.push($$props, true);

	const params = $.prop($$props, 'params', 19, () => ({}));
	var fragment = root();
	var p = $.sibling($.first_child(fragment), 4);
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `Your message is: ${params().wild ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}