import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function Old($$anchor, $$props) {
	$.push($$props, false);

	const count_2 = $.mutable_source();
	let prop = $.prop($$props, 'prop', 8);
	let count_1 = $.mutable_source(prop().count);

	$.legacy_pre_effect(() => ($.deep_read_state(prop())), () => {
		$.set(count_1, prop().count);
	});

	$.legacy_pre_effect(() => ($.deep_read_state(prop())), () => {
		$.set(count_2, prop().count);
	});

	$.legacy_pre_effect_reset();
	$.init();

	var p = root();
	var text = $.only_child(p);

	$.template_effect(() => $.set_text(text, `${$.get(count_1) ?? ''} / ${$.get(count_2) ?? ''}`));
	$.append($$anchor, p);
	$.pop();
}