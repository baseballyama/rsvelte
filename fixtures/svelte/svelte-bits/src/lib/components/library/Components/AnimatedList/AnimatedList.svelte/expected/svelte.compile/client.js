import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, untrack } from 'svelte';

var root = $.from_html(`<div class="mb-4 cursor-pointer al-item" role="option" tabindex="-1"><div><p class="text-white m-0"> </p></div></div>`);
var root_1 = $.from_html(`<div class="absolute top-0 left-0 right-0 h-[50px] pointer-events-none"></div> <div class="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none"></div>`, 1);
var root_2 = $.from_html(`<div><div></div> <!></div>`);

export default function AnimatedList($$anchor, $$props) {
	$.push($$props, true);

	let items = $.prop($$props, 'items', 19, () => [
			'Item 1',
			'Item 2',
			'Item 3',
			'Item 4',
			'Item 5',
			'Item 6',
			'Item 7',
			'Item 8',
			'Item 9',
			'Item 10',
			'Item 11',
			'Item 12',
			'Item 13',
			'Item 14',
			'Item 15'
		]),
		showGradients = $.prop($$props, 'showGradients', 3, true),
		enableArrowNavigation = $.prop($$props, 'enableArrowNavigation', 3, true),
		className = $.prop($$props, 'class', 3, ''),
		itemClass = $.prop($$props, 'itemClass', 3, ''),
		displayScrollbar = $.prop($$props, 'displayScrollbar', 3, true),
		initialSelectedIndex = $.prop($$props, 'initialSelectedIndex', 19, () => -1);

	let listRef;
	let selectedIndex = $.state($.proxy(initialSelectedIndex()));
	let keyboardNav = $.state(false);
	let topGradientOpacity = $.state(0);
	let bottomGradientOpacity = $.state(1);
	let inView = $.state($.proxy([]));

	$.user_effect(() => {
		if ($.get(inView).length !== items().length) {
			untrack(() => $.set(inView, items().map(() => false), true));
		}
	});

	function handleScroll(e) {
		const t = e.currentTarget;

		$.set(topGradientOpacity, Math.min(t.scrollTop / 50, 1), true);

		const bottomDistance = t.scrollHeight - (t.scrollTop + t.clientHeight);

		$.set(bottomGradientOpacity, t.scrollHeight <= t.clientHeight ? 0 : Math.min(bottomDistance / 50, 1), true);
	}

	function inViewAction(node, index) {
		const io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					$.get(inView)[index] = entry.intersectionRatio >= 0.5;
				}
			},
			{ root: listRef, threshold: [0, 0.5, 1] }
		);

		io.observe(node);

		return { destroy: () => io.disconnect() };
	}

	onMount(() => {
		if (!enableArrowNavigation()) return;

		const handler = (e) => {
			if (e.key === 'ArrowDown' || e.key === 'Tab' && !e.shiftKey) {
				e.preventDefault();
				$.set(keyboardNav, true);
				$.set(selectedIndex, Math.min($.get(selectedIndex) + 1, items().length - 1), true);
			} else if (e.key === 'ArrowUp' || e.key === 'Tab' && e.shiftKey) {
				e.preventDefault();
				$.set(keyboardNav, true);
				$.set(selectedIndex, Math.max($.get(selectedIndex) - 1, 0), true);
			} else if (e.key === 'Enter') {
				if ($.get(selectedIndex) >= 0 && $.get(selectedIndex) < items().length) {
					e.preventDefault();
					$$props.onItemSelect?.(items()[$.get(selectedIndex)], $.get(selectedIndex));
				}
			}
		};

		window.addEventListener('keydown', handler);

		return () => window.removeEventListener('keydown', handler);
	});

	$.user_effect(() => {
		if (!$.get(keyboardNav) || $.get(selectedIndex) < 0 || !listRef) return;

		const container = listRef;
		const selectedItem = container.querySelector(`[data-index="${$.get(selectedIndex)}"]`);

		if (selectedItem) {
			const extraMargin = 50;
			const itemTop = selectedItem.offsetTop;
			const itemBottom = itemTop + selectedItem.offsetHeight;

			if (itemTop < container.scrollTop + extraMargin) {
				container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
			} else if (itemBottom > container.scrollTop + container.clientHeight - extraMargin) {
				container.scrollTo({
					top: itemBottom - container.clientHeight + extraMargin,
					behavior: 'smooth'
				});
			}
		}

		untrack(() => $.set(keyboardNav, false));
	});

	var div = root_2();
	var div_1 = $.child(div);

	$.each(div_1, 21, items, $.index, ($$anchor, item, index) => {
		var div_2 = root();

		$.set_attribute(div_2, 'data-index', index);

		let styles;
		var div_3 = $.child(div_2);
		var p = $.child(div_3);
		var text = $.only_child(p, true);

		$.reset(div_3);
		$.reset(div_2);
		$.action(div_2, ($$node, $$action_arg) => inViewAction?.($$node, $$action_arg), () => index);

		$.template_effect(() => {
			$.set_attribute(div_2, 'aria-selected', $.get(selectedIndex) === index);

			styles = $.set_style(div_2, '', styles, {
				transform: $.get(inView)[index] ? 'scale(1)' : 'scale(0.7)',
				opacity: $.get(inView)[index] ? 1 : 0,
				transition: 'transform 0.2s ease 0.1s, opacity 0.2s ease 0.1s'
			});

			$.set_class(div_3, 1, `p-4 bg-[#222] rounded-lg ${$.get(selectedIndex) === index ? 'al-selected' : ''} ${itemClass() ?? ''}`, 'svelte-1raxkg0');
			$.set_text(text, $.get(item));
		});

		$.event('mouseenter', div_2, () => $.set(selectedIndex, index, true));

		$.delegated('click', div_2, () => {
			$.set(selectedIndex, index, true);
			$$props.onItemSelect?.($.get(item), index);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);
	$.bind_this(div_1, ($$value) => listRef = $$value, () => listRef);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var div_4 = $.first_child(fragment);
			var div_5 = $.sibling(div_4, 2);

			$.template_effect(() => {
				$.set_style(div_4, `background: linear-gradient(to bottom, #14110E, transparent); opacity: ${$.get(topGradientOpacity) ?? ''}; transition: opacity 0.3s ease;`);
				$.set_style(div_5, `background: linear-gradient(to top, #14110E, transparent); opacity: ${$.get(bottomGradientOpacity) ?? ''}; transition: opacity 0.3s ease;`);
			});

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if (showGradients()) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `relative w-[500px] ${className() ?? ''}`, 'svelte-1raxkg0');
		$.set_class(div_1, 1, `al-scroll max-h-[400px] overflow-y-auto p-4 ${displayScrollbar() ? 'al-scrollbar' : 'al-scrollbar-hide'}`, 'svelte-1raxkg0');
	});

	$.event('scroll', div_1, handleScroll);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);