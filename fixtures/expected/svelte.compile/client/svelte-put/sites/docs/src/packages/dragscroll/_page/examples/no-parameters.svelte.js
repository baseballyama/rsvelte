import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dragscroll } from '@svelte-put/dragscroll';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="grid grid-cols-[repeat(10,1fr)]"></div>`);
var root_2 = $.from_html(`<div class="mx-auto max-w-4xl overflow-x-auto border-2 border-violet-500 p-4"></div>`);

export default function No_parameters($$anchor, $$props) {
	$.push($$props, true);

	// :::focus
	// :::highlight
	// :::
	// :::
	const classesForOddRows = 'odd:bg-white odd:text-black even:bg-black even:text-white';

	const classesForEvenRows = 'odd:bg-black odd:text-white even:bg-white even:text-black';
	var div = root_2();

	$.each(div, 20, () => new Array(10), $.index, ($$anchor, _, row) => {
		var div_1 = root_1();

		$.each(div_1, 20, () => new Array(10), $.index, ($$anchor, _, col, $$array) => {
			var div_2 = root();

			$.set_class(div_2, 1, `
						grid h-10 w-32 select-none place-items-center
						${row % 2 === 0 ? classesForEvenRows : classesForOddRows}
          `);

			div_2.textContent = row * 10 + col + 1;
			$.append($$anchor, div_2);
		});

		$.reset(div_1);
		$.append($$anchor, div_1);
	});

	$.reset(div);
	$.action(div, ($$node) => dragscroll?.($$node));
	$.append($$anchor, div);
	$.pop();
}