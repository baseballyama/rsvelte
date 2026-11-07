import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { setRegisterItemFunc } from './utils.js';

var root = $.from_html(`<div class="dropdown svelte-lexical"><!></div>`);

export default function DropDownItems($$anchor, $$props) {
	$.push($$props, true);

	let dropDownRef = $.prop($$props, 'dropDownRef', 15);
	let items = [];
	let highlightedItem = $.state(null);

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
			$$props.onClose();
		} else if (key === 'ArrowUp') {
			if ($.get(highlightedItem) === null) {
				$.set(highlightedItem, items[0], true);
			} else {
				const index = items.indexOf($.get(highlightedItem)) - 1;

				$.set(highlightedItem, items[index === -1 ? items.length - 1 : index], true);
			}
		} else if (key === 'ArrowDown') {
			if ($.get(highlightedItem) === null) {
				$.set(highlightedItem, items[0], true);
			} else {
				const index = items.indexOf($.get(highlightedItem)) + 1;

				$.set(highlightedItem, items[index >= items.length ? 0 : index], true);
			}
		}
	}

	onMount(() => {
		if (!$.get(highlightedItem)) {
			$.set(highlightedItem, items[0], true);
		}
	});

	$.user_effect(() => {
		$.get(highlightedItem)?.focus();
	});

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => dropDownRef($$value), () => dropDownRef());
	$.delegated('keydown', div, handleKeyDown);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown']);