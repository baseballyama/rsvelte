import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function _3_2_$effect_tracking_input($$anchor, $$props) {
	$.push($$props, true);

	console.log(
		"in component setup:", // false
		$.effect_tracking()
	);

	$.user_effect(() => {
		console.log(
			"in effect:", // true
			$.effect_tracking()
		);
	});

	var p = root();
	var text = $.only_child(p);

	$.template_effect(($0) => $.set_text(text, `in template: ${$0 ?? ''}`), [() => $.effect_tracking()]);
	$.append($$anchor, p);
	$.pop();
}