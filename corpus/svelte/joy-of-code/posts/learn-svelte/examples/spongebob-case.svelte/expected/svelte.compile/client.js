import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><textarea class="svelte-11c92f9"></textarea></div>`);

export default function Spongebob_case($$anchor, $$props) {
	$.push($$props, true);

	let text = $.state('I love Svelte');

	function toSpongeBobCase(text) {
		return text.split('').map((c, i) => i % 2 === 1 ? c.toUpperCase() : c.toLowerCase()).join('');
	}

	var div = root();
	var textarea = $.child(div);

	$.remove_textarea_child(textarea);
	$.reset(div);
	$.template_effect(($0) => $.set_value(textarea, $0), [() => toSpongeBobCase($.get(text))]);

	$.delegated('input', textarea, (e) => {
		$.set(text, toSpongeBobCase(e.target.value), true);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);