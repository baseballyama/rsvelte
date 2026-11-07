import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';
import { setRegisterItemFunc } from './utils.js';

export default function DropDownItems($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { onClose, dropDownRef = void 0, children } = $$props;
		let items = [];
		let highlightedItem = null;

		function registerItem(itemRef) {
			items.push(itemRef);
		}

		setRegisterItemFunc(registerItem);

		function handleKeyDown(event) {
			if (!items) return;

			const key = event.key;

			if (['Escape', 'ArrowUp', 'ArrowDown', 'Tab'].includes(key)) {
				event.preventDefault();
			}

			if (key === 'Escape' || key === 'Tab') {
				onClose();
			} else if (key === 'ArrowUp') {
				if (highlightedItem === null) {
					highlightedItem = items[0];
				} else {
					const index = items.indexOf(highlightedItem) - 1;

					highlightedItem = items[index === -1 ? items.length - 1 : index];
				}
			} else if (key === 'ArrowDown') {
				if (highlightedItem === null) {
					highlightedItem = items[0];
				} else {
					const index = items.indexOf(highlightedItem) + 1;

					highlightedItem = items[index >= items.length ? 0 : index];
				}
			}
		}

		onMount(() => {
			if (!highlightedItem) {
				highlightedItem = items[0];
			}
		});

		$$renderer.push(`<div class="dropdown svelte-lexical">`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { dropDownRef });
	});
}