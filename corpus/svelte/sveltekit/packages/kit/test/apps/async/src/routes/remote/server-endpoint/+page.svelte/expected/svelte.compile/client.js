import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <button>get</button> <button>post</button>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let result = $.state('');
	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, $.get(result)));
	$.delegated('click', button, () => fetch('/remote/server-endpoint/api').then((r) => r.json()).then((r) => $.set(result, r.result, true)));
	$.delegated('click', button_1, () => fetch('/remote/server-endpoint/api', { method: 'POST' }).then((r) => r.json()).then((r) => $.set(result, r.result, true)));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);