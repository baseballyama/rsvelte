import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p> <button>check</button>`, 1);

export default function Component($$anchor, $$props) {
	$.push($$props, true);

	let tick = $.state(0);
	let ref_exists = $.state(true);

	$.user_effect(() => {
		$.get(tick);
		$.set(ref_exists, $$props.ref !== null);
	});

	var fragment = root();
	var p = $.first_child(fragment);
	var text = $.only_child(p, true);
	var button = $.sibling(p, 2);

	$.template_effect(() => $.set_text(text, $.get(ref_exists)));
	$.delegated('click', button, () => $.update(tick));
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);