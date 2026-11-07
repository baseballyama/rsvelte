import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { swipeable } from '@svelte-put/swipeable';
import { slide } from 'svelte/transition';

var root = $.from_html(`<div class="i i-[trash] absolute left-4 top-1/2 z-0 h-6 w-6 -translate-y-1/2 text-white"></div>`);
var root_1 = $.from_html(`<div class="i i-[archive] absolute right-4 top-1/2 z-0 h-6 w-6 -translate-y-1/2 text-white"></div>`);
var root_2 = $.from_html(`<li><!>  <article class="z-px border-outline bg-bg-100 relative touch-pan-y space-y-1 border p-4"><p class="flex items-center gap-2 leading-normal"><i class="i i-[envelope-simple] h-6 w-6"></i> <span>>></span> <span class="font-medium"> </span></p> <hr/> <p class="text-sm leading-relaxed"> </p></article> <!></li>`);
var root_3 = $.from_html(`<div class="flex items-baseline justify-between gap-4"><p class="mt-0">Swipe left to archive, swipe right to delete</p> <button class="c-btn c-btn--outlined">Reset</button></div> <ul class="relative mt-8 overflow-hidden border border-current p-2"></ul>`, 1);

export default function Demo($$anchor, $$props) {
	$.push($$props, true);

	// :::focus
	// :::highlight
	// :::
	// :::
	const ITEMS = new Array(4).fill(undefined).map(() => ({
		id: 'crypto' in globalThis
			? crypto.randomUUID()
			: Math.random().toString(36).slice(2),
		title: 'Message from Universe',
		excerpt: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. \
			Repudiandae blanditiis nulla perspiciatis quas necessitatibus deleniti! Sapiente fuge...'
	}));

	let items = $.state($.proxy(structuredClone(ITEMS)));
	let direction = $.state(null);

	function swipestart(e) {
		$.set(direction, e.detail.direction, true);
	}

	function swipeend(e) {
		const { passThreshold } = e.detail;

		if (passThreshold) {
			const id = e.target.dataset.id;

			$.set(items, $.get(items).filter((i) => i.id !== id), true);
		}
	}

	function reset() {
		$.set(items, structuredClone(ITEMS), true);
		$.set(direction, null);
	}

	var fragment = root_3();
	var div = $.first_child(fragment);
	var button = $.sibling($.child(div), 2);

	$.reset(div);

	var ul = $.sibling(div, 2);

	$.each(ul, 21, () => $.get(items), ({ id, title, excerpt }) => id, ($$anchor, $$item) => {
		let id = () => $.get($$item).id;
		let title = () => $.get($$item).title;
		let excerpt = () => $.get($$item).excerpt;
		var li = root_2();
		let classes;
		var node = $.child(li);

		{
			var consequent = ($$anchor) => {
				var div_1 = root();

				$.append($$anchor, div_1);
			};

			$.if(node, ($$render) => {
				if ($.get(direction) === 'right') $$render(consequent);
			});
		}

		var article = $.sibling(node, 2);

		$.set_style(article, '', {}, { left: 'var(--swipe-distance-x)' });

		var p = $.child(article);
		var span = $.sibling($.child(p), 4);
		var text = $.only_child(span, true);

		$.reset(p);

		var p_1 = $.sibling(p, 4);
		var text_1 = $.only_child(p_1, true);

		$.reset(article);

		$.action(article, ($$node, $$action_arg) => swipeable?.($$node, $$action_arg), () => ({
			disableTouchEvents: false,
			followThrough: { container: 'ul' }
		}));

		var node_1 = $.sibling(article, 2);

		{
			var consequent_1 = ($$anchor) => {
				var div_2 = root_1();

				$.append($$anchor, div_2);
			};

			$.if(node_1, ($$render) => {
				if ($.get(direction) === 'left') $$render(consequent_1);
			});
		}

		$.reset(li);

		$.template_effect(() => {
			classes = $.set_class(li, 1, 'relative', null, classes, {
				'bg-error-bg': $.get(direction) === 'right',
				'bg-info-bg': $.get(direction) === 'left'
			});

			$.set_attribute(article, 'data-id', id());
			$.set_text(text, title());
			$.set_text(text_1, excerpt());
		});

		$.event('swipestart', article, swipestart);
		$.event('swipeend', article, swipeend);
		$.transition(2, li, () => slide, () => ({ axis: 'y', duration: 200 }));
		$.append($$anchor, li);
	});

	$.reset(ul);
	$.delegated('click', button, reset);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);