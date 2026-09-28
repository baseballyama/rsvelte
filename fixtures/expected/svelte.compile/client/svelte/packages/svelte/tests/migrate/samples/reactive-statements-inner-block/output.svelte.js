import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { run } from 'svelte/legacy';

var root = $.from_html(`<ul></ul>`);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	let menuElement = $.state(undefined);
	let left = $.state(void 0);
	let top = $.state(void 0);

	run(() => {
		if ($.get(menuElement)) {
			const rect = $.get(menuElement).getBoundingClientRect();
			const menuHeight = 0;

			$.set(left, window.innerWidth - rect.width);
			$.set(top, window.innerHeight - menuHeight);
		}
	});

	var ul = root();

	$.bind_this(ul, ($$value) => $.set(menuElement, $$value), () => $.get(menuElement));
	$.append($$anchor, ul);
	$.pop();
}