import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button> </button>`);

export default function Effect($$anchor, $$props) {
	$.push($$props, true);
	let n = $.state(0);
	$.user_effect(() => {
		console.log($.get(n));
	});
	$.user_pre_effect(() => console.log($.get(n)));
	function f() {
		$.user_effect(() => {});
		return 1;
	}
	var button = root();
	var text = $.only_child(button);
	$.template_effect(($0) => $.set_text(text, `${$.get(n) ?? ''} ${$0 ?? ''}`), [() => f()]);
	$.delegated('click', button, () => $.update(n));
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);
