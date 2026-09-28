import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resize } from '@svelte-put/resize';

var root = $.from_html(`<div class="flex flex-col items-center space-y-4"><p>Resize <span class="bg-blue-500 px-2 text-white">blue</span> box (dragging bottom right corner) to
		see change</p> <div class="h-24 w-24 resize overflow-auto bg-blue-500"></div> <div class="flex items-center space-x-2"><label for="resize-enable"> </label> <input type="checkbox" id="resize-enable" class="c-input accent-primary h-5 w-5"/></div></div>`);

export default function Example($$anchor, $$props) {
	$.push($$props, true);

	let enabled = $.state(true);

	function calcBorderRadius(size1, size2) {
		return `${Math.min(100, size1 / 10 + size2 / 10)}px`;
	}

	function onResized(e) {
		const { entry } = e.detail;
		const target = entry.target;

		if (entry.borderBoxSize?.length > 0) {
			target.style.borderRadius = calcBorderRadius(entry.borderBoxSize[0].inlineSize, entry.borderBoxSize[0].blockSize);
		} else {
			target.style.borderRadius = calcBorderRadius(entry.contentRect.width, entry.contentRect.height);
		}
	}

	let box;

	$.user_effect(() => {
		if (!$.get(enabled)) box.style.borderRadius = '8px';
	});

	var div = root();
	var div_1 = $.sibling($.child(div), 2);

	$.action(div_1, ($$node, $$action_arg) => resize?.($$node, $$action_arg), () => ({ enabled: $.get(enabled) }));
	$.bind_this(div_1, ($$value) => box = $$value, () => box);

	var div_2 = $.sibling(div_1, 2);
	var label = $.child(div_2);
	var text = $.only_child(label);
	var input = $.sibling(label, 2);

	$.remove_input_defaults(input);
	$.reset(div_2);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `Check to ${$.get(enabled) ? 'disable' : 'enable'} action:`));
	$.event('resized', div_1, onResized);
	$.bind_checked(input, () => $.get(enabled), ($$value) => $.set(enabled, $$value));
	$.append($$anchor, div);
	$.pop();
}