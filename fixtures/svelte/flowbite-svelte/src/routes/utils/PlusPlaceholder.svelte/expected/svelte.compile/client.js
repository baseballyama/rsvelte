import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

const figure = ($$anchor) => {
	var div = root();

	$.append($$anchor, div);
};

var root = $.from_html(`<div class="flex h-24 items-center justify-center rounded bg-gray-50 dark:bg-gray-800"><p class="text-2xl text-gray-400 dark:text-gray-500"><svg class="h-3.5 w-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"></path></svg></p></div>`);
var root_1 = $.from_html(`<div></div>`);

export default function PlusPlaceholder($$anchor, $$props) {
	let colnum = $.prop($$props, 'colnum', 3, 1),
		rownum = $.prop($$props, 'rownum', 3, 1);

	function calculateGridItems() {
		return colnum() * rownum();
	}

	const colclass = $.derived(() => `grid-cols-${colnum()}`);
	var div_1 = root_1();

	$.each(div_1, 21, () => Array(calculateGridItems()), $.index, ($$anchor, _) => {
		figure($$anchor);
	});

	$.reset(div_1);
	$.template_effect(() => $.set_class(div_1, 1, `mb-4 grid ${$.get(colclass) ?? ''} gap-4`));
	$.append($$anchor, div_1);
}