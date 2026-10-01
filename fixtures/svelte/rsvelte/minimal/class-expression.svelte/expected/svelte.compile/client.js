import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>expression</div> <div>interpolated</div> <div>quoted</div> <div>object</div> <div>array</div> <div>constant</div> <div>literal</div> <div>template</div> <div>call</div> <button>toggle</button> <button>resize</button>`, 1);

export default function Class_expression($$anchor) {
	let active = $.state(false);
	let size = $.state('small');
	let tone = null;
	const base = 'card';

	function variant(v) {
		return `btn-${v}`;
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var div_1 = $.sibling(div, 2);
	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling(div_2, 2);
	var div_4 = $.sibling(div_3, 2);
	var div_5 = $.sibling(div_4, 2);

	$.set_class(div_5, 1, $.clsx(base));

	var div_6 = $.sibling(div_5, 2);

	$.set_class(div_6, 1, 'literal');

	var div_7 = $.sibling(div_6, 2);
	var div_8 = $.sibling(div_7, 2);
	var button = $.sibling(div_8, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $.clsx($.get(size)));
			$.set_class(div_1, 1, `box ${$.get(size) ?? ''} rounded`);
			$.set_class(div_2, 1, $.get(size));
			$.set_class(div_3, 1, $.clsx({ active: $.get(active), large: $.get(size) === 'large' }));
			$.set_class(div_4, 1, $.clsx(['item', $.get(active) && 'is-active', tone]));
			$.set_class(div_7, 1, `t-${$.get(size)}`);
			$.set_class(div_8, 1, $0);
		},
		[() => $.clsx(variant($.get(size)))]
	);

	$.delegated('click', button, () => $.set(active, !$.get(active)));
	$.delegated('click', button_1, () => $.set(size, $.get(size) === 'small' ? 'large' : 'small', true));
	$.append($$anchor, fragment);
}

$.delegate(['click']);