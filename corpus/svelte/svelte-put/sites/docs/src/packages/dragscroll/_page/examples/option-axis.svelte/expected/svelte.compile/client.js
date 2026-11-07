import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dragscroll } from '@svelte-put/dragscroll';

var root = $.from_html(`<div></div>`);
var root_1 = $.from_html(`<div class="grid grid-cols-[repeat(10,1fr)]"></div>`);
var root_2 = $.from_html(`<div class="not-prose mx-auto grid max-w-4xl place-items-center"><div class="flex items-center space-x-4"><p>Select the scroll axis</p> <label class="flex cursor-pointer items-center gap-2"><input class="c-input" type="radio" name="axis" id="x"/> x</label> <label class="flex cursor-pointer items-center gap-2"><input class="c-input" type="radio" name="axis" id="y"/> y</label> <label class="flex cursor-pointer items-center gap-2"><input class="c-input" type="radio" name="axis" id="both"/> both</label></div>  <div class="mt-4 max-h-[300px] max-w-[300px] overflow-x-auto border-2 border-violet-500 md:max-h-[400px] md:max-w-[400px]"></div></div>`);

export default function Option_axis($$anchor, $$props) {
	$.push($$props, true);

	const binding_group = [];

	// :::focus
	// :::highlight
	let axis = 'both';

	// :::
	// :::
	const classesForOddRows = 'odd:bg-white odd:text-black even:bg-black even:text-white';

	const classesForEvenRows = 'odd:bg-black odd:text-white even:bg-white even:text-black';
	var div = root_2();
	var div_1 = $.child(div);
	var label = $.sibling($.child(div_1), 2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	input.value = input.__value = 'x';
	$.next();
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	input_1.value = input_1.__value = 'y';
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	input_2.value = input_2.__value = 'both';
	$.next();
	$.reset(label_2);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.each(div_2, 20, () => new Array(10), $.index, ($$anchor, _, row) => {
		var div_3 = root_1();

		$.each(div_3, 20, () => new Array(10), $.index, ($$anchor, _, col, $$array) => {
			var div_4 = root();

			$.set_class(div_4, 1, `
							grid h-20 w-20 select-none place-items-center
              ${row % 2 === 0 ? classesForEvenRows : classesForOddRows}
            `);

			div_4.textContent = row * 10 + col + 1;
			$.append($$anchor, div_4);
		});

		$.reset(div_3);
		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.action(div_2, ($$node, $$action_arg) => dragscroll?.($$node, $$action_arg), () => ({ axis }));
	$.reset(div);
	$.bind_group(binding_group, [], input, () => axis, ($$value) => axis = $$value);
	$.bind_group(binding_group, [], input_1, () => axis, ($$value) => axis = $$value);
	$.bind_group(binding_group, [], input_2, () => axis, ($$value) => axis = $$value);
	$.append($$anchor, div);
	$.pop();
}