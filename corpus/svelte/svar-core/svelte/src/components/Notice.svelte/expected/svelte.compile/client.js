import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from "svelte/transition";

var root = $.from_html(`<div role="status" aria-live="polite"><div class="wx-text svelte-1y31rgg"> </div> <div class="wx-button svelte-1y31rgg"><i class="wxi-close svelte-1y31rgg"></i></div></div>`);

export default function Notice($$anchor, $$props) {
	$.push($$props, true);

	let notice = $.prop($$props, 'notice', 19, () => ({}));

	function onRemove() {
		if (notice().remove) notice().remove();
	}

	var div = root();
	var div_1 = $.child(div);
	var text = $.only_child(div_1, true);
	var div_2 = $.sibling(div_1, 2);
	var i = $.only_child(div_2);

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `wx-notice wx-${(notice().type ? notice().type : '') ?? ''}`, 'svelte-1y31rgg');
		$.set_text(text, notice().text);
	});

	$.delegated('click', i, onRemove);
	$.transition(3, div, () => fade);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);