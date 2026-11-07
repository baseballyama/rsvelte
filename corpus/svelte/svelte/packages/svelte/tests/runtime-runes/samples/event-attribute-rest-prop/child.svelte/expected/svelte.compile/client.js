import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'label']);
var root = $.from_html(`<button> </button>`);

export default function Child($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var button = root();
	var text = $.only_child(button, true);

	$.template_effect(() => $.set_text(text, $$props.label));
	$.delegated('click', button, () => $$props?.onclick());
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);