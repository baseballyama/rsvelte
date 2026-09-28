import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<button type="button"> </button>`);
var root_1 = $.from_html(`<nav class="btn-group preset-outlined-surface-200-800 flex-col md:flex-row"></nav>`);

export default function Group($$anchor) {
	let active = $.state('january');
	const months = ['january', 'february', 'march'];
	var nav = root_1();

	$.each(nav, 20, () => months, (month) => month, ($$anchor, month) => {
		var button = root();
		var text = $.only_child(button, true);

		$.template_effect(() => {
			$.set_class(button, 1, `btn capitalize ${month === $.get(active) ? 'preset-filled' : 'preset-tonal'}`);
			$.set_text(text, month);
		});

		$.delegated('click', button, () => $.set(active, month, true));
		$.append($$anchor, button);
	});

	$.reset(nav);
	$.append($$anchor, nav);
}

$.delegate(['click']);