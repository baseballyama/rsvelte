import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { IconLoader2 } from '@tabler/icons-svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<span class="filter-chip inline-flex items-center gap-1 px-2 py-0.5 text-sm font-medium rounded-md select-none bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><span class="text-xs opacity-70"> </span> <span> </span> <button type="button" class="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5" aria-label="Remove filter"><svg class="size-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button></span>`);
var root_1 = $.from_html(`<div class="absolute end-3 top-1/2 -translate-y-1/2"><!></div>`);
var root_2 = $.from_html(`<span class="text-xs text-gray-500 dark:text-gray-400"> </span>`);
var root_3 = $.from_html(`<span class="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100">filter</span>`);
var root_4 = $.from_html(`<button type="button"><div class="flex flex-col"><span class="text-sm font-medium text-gray-900 dark:text-white"> </span> <!></div> <!></button>`);
var root_5 = $.from_html(`<div class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"><div class="py-1 max-h-60 overflow-y-auto"></div></div>`);
var root_6 = $.from_html(`<div class="relative"><div class="relative"><svg class="absolute start-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg> <div class="flex items-center flex-wrap gap-2 ps-10 pe-4 py-3"><!> <div class="flex-1 min-w-[200px] text-gray-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 svelte-oeoh2d" contenteditable="true" role="textbox" tabindex="0" aria-multiline="false" spellcheck="false"></div></div> <!></div> <!></div>`);

export default function SearchInput($$anchor, $$props) {
	$.push($$props, true);

	let inputElement = $.state(null);
	let suggestionsContainer = $.state(null);

	// Randomly select a placeholder on mount
	const placeholderIndex = Math.floor(Math.random() * 10) + 1;

	const placeholder = $.derived(() => s(`search.placeholder_${placeholderIndex}`) || 'Let your search take flight...');

	// Expose the input element to parent
	function getElement() {
		return $.get(inputElement);
	}

	// Expose the text extraction method
	function getTextFromContentEditable() {
		return getTextFromContentEditableInternal();
	}

	function handleInput() {
		if (!$.get(inputElement)) return;

		// Don't process input events while applying chips
		// This prevents the chip from being immediately cleared
		const text = getTextFromContentEditableInternal();

		const cursorPosition = getCursorPosition();

		$$props.onInput(text, cursorPosition);
	}

	function handleKeyDown(event) {
		$$props.onKeydown(event);
	}

	function handleSuggestionClick(suggestion) {
		$$props.onApplySuggestion(suggestion);
	}

	function getTextFromContentEditableInternal() {
		if (!$.get(inputElement)) return '';

		// Simple text extraction since filters are separate now
		return $.get(inputElement).textContent || '';
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

	// Scroll selected suggestion into view
	$.user_effect(() => {
		if ($$props.suggestions.length > 0 && $.get(suggestionsContainer)) {
			const selectedButton = $.get(suggestionsContainer).children[$$props.selectedSuggestionIndex];

			if (selectedButton) {
				selectedButton.scrollIntoView({ behavior: 'instant', block: 'nearest' });
			}
		}
	});

	var $$exports = { getElement, getTextFromContentEditable };
	var div = root_6();
	var div_1 = $.child(div);
	var div_2 = $.sibling($.child(div_1), 2);
	var node = $.child(div_2);

	$.each(node, 17, () => $$props.filters, $.index, ($$anchor, filter, index) => {
		var span = root();
		var span_1 = $.child(span);
		var text_1 = $.only_child(span_1);
		var span_2 = $.sibling(span_1, 2);
		var text_2 = $.only_child(span_2, true);
		var button = $.sibling(span_2, 2);

		$.reset(span);

		$.template_effect(() => {
			$.set_text(text_1, `${$.get(filter).type ?? ''}:`);
			$.set_text(text_2, $.get(filter).display);
		});

		$.delegated('click', button, () => $$props.onRemoveFilter(index));
		$.append($$anchor, span);
	});

	var div_3 = $.sibling(node, 2);

	$.bind_this(div_3, ($$value) => $.set(inputElement, $$value), () => $.get(inputElement));
	$.reset(div_2);

	var node_1 = $.sibling(div_2, 2);

	{
		var consequent = ($$anchor) => {
			var div_4 = root_1();
			var node_2 = $.child(div_4);

			IconLoader2(node_2, { class: 'size-4 text-blue-500 animate-spin' });
			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_1, ($$render) => {
			if ($$props.isLoading) $$render(consequent);
		});
	}

	$.reset(div_1);

	var node_3 = $.sibling(div_1, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_5 = root_5();
			var div_6 = $.child(div_5);

			$.each(div_6, 21, () => $$props.suggestions, $.index, ($$anchor, suggestion, index) => {
				var button_1 = root_4();
				var div_7 = $.child(button_1);
				var span_3 = $.child(div_7);
				var text_3 = $.only_child(span_3, true);
				var node_4 = $.sibling(span_3, 2);

				{
					var consequent_1 = ($$anchor) => {
						var span_4 = root_2();
						var text_4 = $.only_child(span_4, true);

						$.template_effect(() => $.set_text(text_4, $.get(suggestion).label));
						$.append($$anchor, span_4);
					};

					$.if(node_4, ($$render) => {
						if ($.get(suggestion).label !== $.get(suggestion).display) $$render(consequent_1);
					});
				}

				$.reset(div_7);

				var node_5 = $.sibling(div_7, 2);

				{
					var consequent_2 = ($$anchor) => {
						var span_5 = root_3();

						$.append($$anchor, span_5);
					};

					$.if(node_5, ($$render) => {
						if ($.get(suggestion).isFilterType) $$render(consequent_2);
					});
				}

				$.reset(button_1);

				$.template_effect(() => {
					$.set_class(button_1, 1, `w-full px-3 py-2 text-start hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between group ${index === $$props.selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`);
					$.set_text(text_3, $.get(suggestion).display);
				});

				$.delegated('click', button_1, () => handleSuggestionClick($.get(suggestion)));
				$.append($$anchor, button_1);
			});

			$.reset(div_6);
			$.bind_this(div_6, ($$value) => $.set(suggestionsContainer, $$value), () => $.get(suggestionsContainer));
			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_3, ($$render) => {
			if ($$props.suggestions.length > 0) $$render(consequent_3);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_attribute(div_3, 'aria-label', $0);
			$.set_attribute(div_3, 'placeholder', $.get(placeholder));
		},
		[
			() => s("search.search_news_stories") || "Search news stories"
		]
	);

	$.delegated('input', div_3, handleInput);
	$.delegated('keydown', div_3, handleKeyDown);
	$.event('paste', div_3, handlePaste);
	$.delegated('beforeinput', div_3, handleBeforeInput);

	$.event('focus', div_3, function (...$$args) {
		$$props.onFocus?.apply(this, $$args);
	});

	$.event('blur', div_3, function (...$$args) {
		$$props.onBlur?.apply(this, $$args);
	});

	$.append($$anchor, div);

	return $.pop($$exports);
}

$.delegate(['click', 'input', 'keydown', 'beforeinput']);