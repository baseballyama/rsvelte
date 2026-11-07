import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tween } from "svelte/motion";
import { cubicOut } from "svelte/easing";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'type', 'value']);
var root = $.from_html(`<div class="w-full"><div><div></div></div></div>`);

export default function Progress($$anchor, $$props) {
	$.push($$props, true);

	let type = $.prop($$props, 'type', 3, undefined),
		value = $.prop($$props, 'value', 3, 0),
		rest = $.rest_props($$props, rest_excludes);

	const tween = Tween.of(() => value(), { duration: 400, easing: cubicOut });

	let widthClass = $.derived(() => {
		return "width:" + tween.current + "%";
	});

	const typeObj = {
		success: "bg-kui-light-blue-700 dark:bg-kui-dark-blue-700",
		error: "bg-kui-light-red-700 dark:bg-kui-dark-red-700",
		warning: "bg-kui-light-amber-700 dark:bg-kui-dark-amber-700",
		secondary: "bg-kui-light-gray-700 dark:bg-kui-dark-gray-700"
	};

	let progressClass = $.derived(() => {
		if (type()) {
			return typeObj[type()];
		}

		return `dark:bg-kui-light-gray-300 bg-kui-dark-gray-200`;
	});

	var div = root();
	var div_1 = $.child(div);

	$.attribute_effect(div_1, () => ({
		role: 'progressbar',
		'aria-valuenow': tween.current,
		'aria-valuemin': '0',
		'aria-valuemax': '100',
		class: 'dark:bg-kui-dark-gray-200 bg-kui-light-gray-300 h-2.5 w-full rounded-full',
		...rest
	}));

	var div_2 = $.only_child(div_1);

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div_2, 1, `h-2.5 ${$.get(progressClass) ?? ''} rounded-full`);
		$.set_style(div_2, $.get(widthClass));
	});

	$.append($$anchor, div);
	$.pop();
}