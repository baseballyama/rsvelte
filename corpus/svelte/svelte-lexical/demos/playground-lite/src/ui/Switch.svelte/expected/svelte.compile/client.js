import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="switch svelte-43el62"><label class="svelte-43el62"> </label> <button role="switch" class="svelte-43el62"><span class="svelte-43el62"></span></button></div>`);

export default function Switch($$anchor, $$props) {
	let id = $.prop($$props, 'id', 3, undefined);
	const buttonId = 'id_' + Math.floor(Math.random() * 10000);
	var div = root();
	var label = $.child(div);
	var text_1 = $.only_child(label, true);
	var button = $.sibling(label, 2);

	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(div, 'id', id());
		$.set_attribute(label, 'for', buttonId);
		$.set_text(text_1, $$props.text);
		$.set_attribute(button, 'aria-checked', $$props.checked ? 'true' : 'false');
		$.set_attribute(button, 'aria-label', $$props.text);
		$.set_attribute(button, 'id', buttonId);
	});

	$.delegated('click', button, function (...$$args) {
		$$props.onclick?.apply(this, $$args);
	});

	$.append($$anchor, div);
}

$.delegate(['click']);