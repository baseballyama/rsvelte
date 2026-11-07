import * as $ from 'svelte/internal/server';
import { IconLoader2 } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';

export default function SearchInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			filters,
			suggestions,
			selectedSuggestionIndex,
			isLoading,
			onInput,
			onKeydown,
			onApplySuggestion,
			onRemoveFilter,
			onFocus,
			onBlur
		} = $$props;

		let inputElement = null;
		let suggestionsContainer = null;

		// Randomly select a placeholder on mount
		const placeholderIndex = Math.floor(Math.random() * 10) + 1;

		const placeholder = $.derived(() => s(`search.placeholder_${placeholderIndex}`) || 'Let your search take flight...');

		// Expose the input element to parent
		function getElement() {
			return inputElement;
		}

		// Expose the text extraction method
		function getTextFromContentEditable() {
			return getTextFromContentEditableInternal();
		}

		function handleInput() {
			if (!inputElement) return;

			// Don't process input events while applying chips
			// This prevents the chip from being immediately cleared
			const text = getTextFromContentEditableInternal();

			const cursorPosition = getCursorPosition();

			onInput(text, cursorPosition);
		}

		function handleKeyDown(event) {
			onKeydown(event);
		}

		function handleSuggestionClick(suggestion) {
			onApplySuggestion(suggestion);
		}

		function getTextFromContentEditableInternal() {
			if (!inputElement) return '';

			// Simple text extraction since filters are separate now
			return inputElement.textContent || '';
		}

		function getCursorPosition() {
			const selection = window.getSelection();

			if (!selection || selection.rangeCount === 0) return 0;

			return selection.getRangeAt(0).startOffset;
		}

		function handlePaste(event) {
			event.preventDefault();

			const text = event.clipboardData?.getData('text/plain') || '';

			document.execCommand('insertText', false, text);
		}

		function handleBeforeInput(event) {
			// Prevent certain input types that could break our chip structure
			if (event.inputType === 'insertParagraph' || event.inputType === 'insertLineBreak') {
				event.preventDefault();
			}
		}

		$$renderer.push(`<div class="relative"><div class="relative"><svg class="absolute start-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> <div class="flex items-center flex-wrap gap-2 ps-10 pe-4 py-3"><!--[-->`);

		const each_array = $.ensure_array_like(
			// Scroll selected suggestion into view
			filters
		);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let filter = each_array[index];

			$$renderer.push(`<span class="filter-chip inline-flex items-center gap-1 px-2 py-0.5 text-sm font-medium rounded-md select-none bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><span class="text-xs opacity-70">${$.escape(filter.type)}:</span> <span>${$.escape(filter.display)}</span> <button type="button" class="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5" aria-label="Remove filter"><svg class="size-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></span>`);
		}

		$$renderer.push(`<!--]--> <div class="flex-1 min-w-[200px] text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 svelte-oeoh2d" contenteditable="true" role="textbox" tabindex="0"${$.attr('aria-label', s("search.search_news_stories") || "Search news stories")} aria-multiline="false"${$.attr('placeholder', placeholder())} spellcheck="false"></div></div> `);

		if (isLoading) {
			$$renderer.push(`<!--[0--><div class="absolute end-3 top-1/2 -translate-y-1/2">`);
			IconLoader2($$renderer, { class: 'size-4 text-blue-500 animate-spin' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (suggestions.length > 0) {
			$$renderer.push(`<!--[0--><div class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"><div class="py-1 max-h-60 overflow-y-auto"><!--[-->`);

			const each_array_1 = $.ensure_array_like(suggestions);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let suggestion = each_array_1[index];

				$$renderer.push(`<button${$.attr_class(`w-full px-3 py-2 text-start hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group ${index === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`)} type="button"><div class="flex flex-col"><span class="text-sm font-medium text-gray-900 dark:text-white">${$.escape(suggestion.display)}</span> `);

				if (suggestion.label !== suggestion.display) {
					$$renderer.push(`<!--[0--><span class="text-xs text-gray-500 dark:text-gray-400">${$.escape(suggestion.label)}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> `);

				if (suggestion.isFilterType) {
					$$renderer.push(`<!--[0--><span class="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100">filter</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></button>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { getElement, getTextFromContentEditable });
	});
}