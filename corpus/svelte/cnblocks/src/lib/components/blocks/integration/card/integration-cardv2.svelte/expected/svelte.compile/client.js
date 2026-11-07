import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div role="presentation"></div> <div class="relative z-20 m-auto size-fit *:size-8"><!></div></div>`);

export default function Integration_cardv2($$anchor, $$props) {
	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.sibling(div_1, 2);
	var node = $.child(div_2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, $.clsx([
			"relative flex size-20 rounded-xl bg-background dark:bg-transparent",
			$$props.class
		]));

		$.set_class(div_1, 1, $.clsx([
			"absolute inset-0 rounded-xl border border-black/20 dark:border-white/25",
			$$props.borderClassName
		]));
	});

	$.append($$anchor, div);
}