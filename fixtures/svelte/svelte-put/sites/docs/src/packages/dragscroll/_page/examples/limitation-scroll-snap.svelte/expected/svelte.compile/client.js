import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { dragscroll } from '@svelte-put/dragscroll';

var root = $.from_html(`<li class="mx-[20%] grid h-20 w-2/3 shrink-0 snap-center place-items-center odd:bg-green-200 even:bg-blue-200"></li>`);

var root_1 = $.from_html(`<ul class="not-prose mx-auto flex max-w-4xl snap-x snap-mandatory overflow-x-auto border-2
	border-violet-500 p-4 text-black"></ul>`);

export default function Limitation_scroll_snap($$anchor, $$props) {
	$.push($$props, true);

	var ul = root_1();

	$.each(ul, 20, () => new Array(10), $.index, ($$anchor, _, i) => {
		var li = root();

		li.textContent = i + 1;
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.action(ul, ($$node, $$action_arg) => dragscroll?.($$node, $$action_arg), () => ({ axis: 'x' }));
	$.append($$anchor, ul);
	$.pop();
}