import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { VList } from 'virtua/svelte';
import { focusManager } from '$lib/focus.svelte';

var root = $.from_html(`<div class="mx-2"><!></div>`);
var root_1 = $.from_html(`<div class="h-full"><!></div>`);

export default function BaseList($$anchor, $$props) {
	$.push($$props, true);

	let isItemSelectable = $.prop($$props, 'isItemSelectable', 3, () => true),
		selectedIndex = $.prop($$props, 'selectedIndex', 15, 0),
		listElement = $.prop($$props, 'listElement', 15),
		vlistInstance = $.prop($$props, 'vlistInstance', 15);

	function findNextSelectableIndex(startIndex, direction) {
		if ($$props.items.length === 0) return -1;

		let currentIndex = startIndex;

		for (let i = 0; i < $$props.items.length; i++) {
			currentIndex = (currentIndex + direction + $$props.items.length) % $$props.items.length;

			if (isItemSelectable()($$props.items[currentIndex])) {
				return currentIndex;
			}
		}

		return -1;
	}

	$.user_effect(() => {
		if ($$props.items.length > 0 && (selectedIndex() < 0 || !isItemSelectable()($$props.items[selectedIndex()]))) {
			selectedIndex(findNextSelectableIndex(selectedIndex(), 1));
		} else if (selectedIndex() >= $$props.items.length) {
			selectedIndex(findNextSelectableIndex($$props.items.length - 1, 1));
		}
	});

	$.user_effect(() => {
		if (selectedIndex() !== -1 && vlistInstance()) {
			vlistInstance().scrollToIndex(selectedIndex(), { align: 'nearest' });
		}
	});

	function handleKeydown(event) {
		if (focusManager.activeScope !== 'main-input') {
			return;
		}

		if ($$props.items.length === 0) return;

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex(findNextSelectableIndex(selectedIndex(), -1));
				break;

			case 'ArrowDown':
				event.preventDefault();
				selectedIndex(findNextSelectableIndex(selectedIndex(), 1));
				break;
		}
	}

	function handleClick(index) {
		if (isItemSelectable()($$props.items[index])) {
			selectedIndex(index);
			$$props.onenter($$props.items[index]);
		}
	}

	var div = root_1();

	$.event('keydown', $.window, handleKeydown);

	var node = $.child(div);

	{
		const children = ($$anchor, item = $.noop, index = $.noop) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			$.snippet(node_1, () => $$props.itemSnippet, () => ({
				item: item(),
				isSelected: selectedIndex() === index(),
				onclick: () => handleClick(index())
			}));

			$.reset(div_1);
			$.template_effect(() => $.set_attribute(div_1, 'data-index', index()));
			$.append($$anchor, div_1);
		};

		$.bind_this(
			VList(node, {
				get data() {
					return $$props.items;
				},
				getKey: (item) => item.id,
				class: 'h-full py-2',
				get onscroll() {
					return $$props.onscroll;
				},
				children,
				$$slots: { default: true }
			}),
			($$value) => vlistInstance($$value),
			() => vlistInstance()
		);
	}

	$.reset(div);
	$.bind_this(div, ($$value) => listElement($$value), () => listElement());
	$.append($$anchor, div);
	$.pop();
}