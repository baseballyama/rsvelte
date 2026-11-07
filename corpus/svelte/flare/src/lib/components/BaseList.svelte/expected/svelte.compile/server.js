import * as $ from 'svelte/internal/server';
import { VList } from 'virtua/svelte';
import { focusManager } from '$lib/focus.svelte';

export default function BaseList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			items,
			itemSnippet,
			onenter,
			isItemSelectable = () => true,
			selectedIndex = 0,
			listElement = void 0,
			onscroll,
			vlistInstance = void 0
		} = $$props;

		function findNextSelectableIndex(startIndex, direction) {
			if (items.length === 0) return -1;

			let currentIndex = startIndex;

			for (let i = 0; i < items.length; i++) {
				currentIndex = (currentIndex + direction + items.length) % items.length;

				if (isItemSelectable(items[currentIndex])) {
					return currentIndex;
				}
			}

			return -1;
		}

		function handleKeydown(event) {
			if (focusManager.activeScope !== 'main-input') {
				return;
			}

			if (items.length === 0) return;

			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault();
					selectedIndex = findNextSelectableIndex(selectedIndex, -1);
					break;

				case 'ArrowDown':
					event.preventDefault();
					selectedIndex = findNextSelectableIndex(selectedIndex, 1);
					break;
			}
		}

		function handleClick(index) {
			if (isItemSelectable(items[index])) {
				selectedIndex = index;
				onenter(items[index]);
			}
		}

		$$renderer.push(`<div class="h-full">`);

		{
			function children($$renderer, item, index) {
				$$renderer.push(`<div${$.attr('data-index', index)} class="mx-2">`);

				itemSnippet($$renderer, {
					item,
					isSelected: selectedIndex === index,
					onclick: () => handleClick(index)
				});

				$$renderer.push(`<!----></div>`);
			}

			VList($$renderer, {
				data: items,
				getKey: (item) => item.id,
				class: 'h-full py-2',
				onscroll,
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { selectedIndex, listElement, vlistInstance });
	});
}