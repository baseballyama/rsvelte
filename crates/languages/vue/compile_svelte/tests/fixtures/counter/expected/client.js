import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

import { toDisplayString } from 'vue';

var root = $.from_html(`<div class="counter"><button class="dec">-</button><span class="count"> </span><button class="inc">+</button></div><p> </p>`, 1);

export default function Counter_vue($$anchor, $$props) {
	$.push($$props, true);
	let count = $.state(0);
	let doubled = $.derived(() => $.get(count) * 2);
	var fragment = root();
	var div = $.first_child(fragment);
	var button = $.child(div);
	var span = $.sibling(button);
	var text = $.only_child(span, true);
	var button_1 = $.sibling(span);
	$.reset(div);
	var p = $.sibling(div);
	var text_1 = $.only_child(p);
	$.template_effect(($0, $1) => {
		$.set_text(text, $0);
		$.set_text(text_1, `doubled: ${$1 ?? ''}`);
	}, [() => toDisplayString($.get(count)), () => toDisplayString($.get(doubled))]);
	$.delegated('click', button, (event) => $.update(count, -1));
	$.delegated('click', button_1, (event_1) => $.update(count));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);
