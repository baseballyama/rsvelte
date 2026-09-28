import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const bars = Array(12).fill(0);
var root = $.from_html(`<div class="sonner-loading-bar"></div>`);
var root_1 = $.from_html(`<div><div class="sonner-spinner"></div></div>`);

export default function Loader($$anchor, $$props) {
	$.push($$props, true);

	var div = root_1();
	var div_1 = $.child(div);

	$.each(div_1, 23, () => bars, (_, i) => `spinner-bar-${i}`, ($$anchor, _) => {
		var div_2 = root();

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_class(div, 1, $0);
			$.set_attribute(div, 'data-visible', $$props.visible);
		},
		[
			() => $.clsx(['sonner-loading-wrapper', $$props.class].filter(Boolean).join(' '))
		]
	);

	$.append($$anchor, div);
	$.pop();
}