import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><div class="hidden w-1/2 items-center lg:flex"><div></div></div> <div><!></div></div>`);

export default function Row($$anchor, $$props) {
	let reversed = $.prop($$props, 'reversed', 3, false),
		divide = $.prop($$props, 'divide', 3, false),
		contain = $.prop($$props, 'contain', 3, false),
		h_full = $.prop($$props, 'h_full', 3, false);

	var div = root();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	let classes;

	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	let classes_1;
	var node = $.child(div_3);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_3);
	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `flex self-stretch py-6 lg:gap-16 lg:py-10 ${reversed() ? 'flex-row-reverse' : 'flex-row'}`);
		classes = $.set_class(div_2, 1, `grow bg-no-repeat ${contain() ? 'bg-contain' : 'bg-cover'} rounded-lg ${$$props.image ?? ''}`, null, classes, { 'min-h-full': h_full(), 'h-96': !h_full() });
		classes_1 = $.set_class(div_3, 1, 'flex w-1/2 grow flex-col items-start gap-4 lg:gap-8 dark:divide-gray-700', null, classes_1, { 'divide-y': divide() });
	});

	$.append($$anchor, div);
}