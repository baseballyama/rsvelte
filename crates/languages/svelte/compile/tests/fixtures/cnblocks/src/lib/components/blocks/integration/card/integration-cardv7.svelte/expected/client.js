import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div><!></div></div>`);

export default function Integration_cardv7($$anchor, $$props) {
	let _class = $.prop($$props, 'class', 3, ""),
		isCenter = $.prop($$props, 'isCenter', 3, false);

	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children);
	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx([
			"relative z-20 flex size-12 rounded-full border bg-background",
			_class()
		]));

		$.set_class(div_1, 1, $.clsx(["m-auto size-fit *:size-5", isCenter() && "*:size-8"]));
	});

	$.append($$anchor, div);
}