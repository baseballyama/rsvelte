import 'svelte/internal/disclose-version';

import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>shorthand</div> <div>with class</div> <div>with expression</div> <div>calls</div> <div>static</div> <div>interpolated</div> <button> </button> <button>toggle</button>`, 1);

export default function Class_directive($$anchor) {
	let active = $.state(false);
	let count = $.state(0);
	let theme = 'light';
	const flag = true;
	function even(n) {
		return n % 2 === 0;
	}
	var fragment = root();
	var div = $.first_child(fragment);
	let classes;
	var div_1 = $.sibling(div, 2);
	let classes_1;
	var div_2 = $.sibling(div_1, 2);
	let classes_2;
	var div_3 = $.sibling(div_2, 2);
	let classes_3;
	var div_4 = $.sibling(div_3, 2);
	$.set_class(div_4, 1, '', null, {}, { fixed: flag });
	var div_5 = $.sibling(div_4, 2);
	let classes_4;
	var button = $.sibling(div_5, 2);
	var text = $.only_child(button, true);
	var button_1 = $.sibling(button, 2);
	$.template_effect(($0, $1) => {
		classes = $.set_class(div, 1, '', null, classes, { active: $.get(active) });
		classes_1 = $.set_class(div_1, 1, 'panel', null, classes_1, { active: $.get(active), 'is-large': $.get(count) > 3 });
		classes_2 = $.set_class(div_2, 1, $.clsx(theme), null, classes_2, { active: !$.get(active) });
		classes_3 = $.set_class(div_3, 1, '', null, classes_3, { even: $0, odd: $1 });
		classes_4 = $.set_class(div_5, 1, 'a light', null, classes_4, { b: $.get(active) });
		$.set_text(text, $.get(count));
	}, [() => even($.get(count)), () => !even($.get(count))]);
	$.delegated('click', button, () => $.update(count));
	$.delegated('click', button_1, () => $.set(active, !$.get(active)));
	$.append($$anchor, fragment);
}

$.delegate(['click']);
