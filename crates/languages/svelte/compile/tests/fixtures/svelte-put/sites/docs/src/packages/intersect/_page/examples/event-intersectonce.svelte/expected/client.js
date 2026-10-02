import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { intersect } from '@svelte-put/intersect';
import { fly } from 'svelte/transition';

var root = $.from_html(`<li></li>`);
var root_1 = $.from_html(`<ul class="max-h-[400px] w-full space-y-20 overflow-hidden overflow-y-auto p-4"></ul>`);

export default function Event_intersectonce($$anchor) {
	let ulElement = $.state(void 0);

	let intersectionMap = $.proxy({
		one: false,
		two: false,
		three: false,
		four: false,
		five: false,
		six: false,
		seven: false,
		eight: false
	});

	var ul = root_1();

	$.each(ul, 20, () => Object.keys(intersectionMap), (key) => key, ($$anchor, key) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.key(node, () => intersectionMap[key], ($$anchor) => {
			var li = root();
			let classes;

			$.action(li, ($$node, $$action_arg) => intersect?.($$node, $$action_arg), () => ({ threshold: 0.4, root: $.get(ulElement) }));
			$.template_effect(() => classes = $.set_class(li, 1, 'odd:bg-success-fg even:bg-info-fg h-[300px] marker:content-none', null, classes, { invisible: !intersectionMap[key] }));
			$.event('intersectonce', li, () => intersectionMap[key] = true);
			$.transition(1, li, () => fly, () => ({ y: 100, duration: 250 }));
			$.append($$anchor, li);
		});

		$.append($$anchor, fragment);
	});

	$.reset(ul);
	$.bind_this(ul, ($$value) => $.set(ulElement, $$value), () => $.get(ulElement));
	$.append($$anchor, ul);
}