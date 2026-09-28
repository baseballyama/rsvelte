import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<!> <button type="button"> </button>`, 1);
var root_1 = $.from_html(`<span> </span>`);
var root_2 = $.from_html(`<span class="select-none svelte-5uclpr" role="region" aria-label="Selectable text for flashcards"></span>`);

export default function SelectableText($$anchor, $$props) {
	$.push($$props, true);

	// Section name for context tracking
	let flashcardMode = $.prop($$props, 'flashcardMode', 3, false),
		selectedWords = $.prop($$props, 'selectedWords', 19, () => new Set()),
		selectedPhrases = $.prop($$props, 'selectedPhrases', 19, () => new Map()),
		shouldJiggle = $.prop($$props, 'shouldJiggle', 3, false);

	// Log whenever selectedPhrases changes
	$.user_effect(() => {
		console.log('[SelectableText] Props updated - selectedPhrases:', selectedPhrases().size, Array.from(selectedPhrases().keys()));
	});

	// Drag selection state
	let isDragging = $.state(false);

	let dragStartIndex = $.state(null);
	let dragEndIndex = $.state(null);
	let hoveredPhraseRange = $.state(null);

	// Check if a word/position is part of any selected phrase
	// Returns the range [startIndex, endIndex] if the position is in a selected phrase, or null
	function getSelectedPhraseRange(checkIndex) {
		// Check all selected phrases to see if this position falls within one
		for (const [phraseText, phraseData] of selectedPhrases().entries()) {
			const phraseWords = phraseText.split(' ');

			// Try to find this phrase in the parts array
			for (let startIdx = 0; startIdx < $.get(parts).length; startIdx++) {
				// Only start matching from word positions
				if ($.get(parts)[startIdx].type !== 'word') continue;

				let wordIdx = 0;
				let currentIdx = startIdx;
				let firstWordIdx = startIdx;
				let lastWordIdx = startIdx;

				// Try to match all words in the phrase sequentially
				while (wordIdx < phraseWords.length && currentIdx < $.get(parts).length) {
					if ($.get(parts)[currentIdx].type === 'word') {
						if ($.get(parts)[currentIdx].content.toLowerCase() === phraseWords[wordIdx]) {
							if (wordIdx === 0) firstWordIdx = currentIdx;

							lastWordIdx = currentIdx;
							wordIdx++;
						} else {
							break; // Mismatch
						}
					}

					currentIdx++;
				}

				// If we matched all words and the check index is in this range
				// Include everything from first word to last word (including spaces/punctuation between)
				if (wordIdx === phraseWords.length && checkIndex >= firstWordIdx && checkIndex < currentIdx) {
					console.log('[SelectableText] Found phrase match:', phraseText, 'at indices', firstWordIdx, '-', currentIdx - 1, 'checking index', checkIndex);

					return { start: firstWordIdx, end: currentIdx - 1 };
				}
			}
		}

		return null;
	}

	// Parse text into words and non-words (punctuation, spaces)
	// Updated regex to handle hyphens and accented characters: "self-control", "café", "naïve"
	function parseText(text) {
		const parts = [];

		// Match words with Unicode letters, hyphens, and apostrophes
		// \p{L} matches any Unicode letter (including accented characters)
		const regex = /([\p{L}]+(?:[-'][\p{L}]+)*)|([^\p{L}]+)/gu;

		let match = regex.exec(text);

		while (match !== null) {
			if (match[1]) {
				// It's a word (possibly with hyphens)
				parts.push({ type: 'word', content: match[1] });
			} else if (match[2]) {
				// It's punctuation/whitespace
				parts.push({ type: 'other', content: match[2] });
			}

			match = regex.exec(text);
		}

		return parts;
	}

	// Remove citation markers like [2], [common], [domain#1] from text before parsing
	// Also normalize spaces (remove extra spaces and spaces before punctuation)
	const cleanedText = $.derived(() => $$props.text.replace(/\[[^\]]+\]/g, '').// Remove citation markers
	replace(/\s+/g, ' ').// Normalize multiple spaces to single space
	replace(/\s+([.,;:!?)])/g, '$1').// Remove space before punctuation
	trim());

	const parts = $.derived(() => parseText($.get(cleanedText)));

	function handleMouseDown(wordIndex, event) {
		if (!flashcardMode() || !$$props.onWordClick) return;

		event.preventDefault();
		event.stopPropagation();

		// Check if this word is part of an existing phrase
		const phraseRange = getSelectedPhraseRange(wordIndex);

		if (phraseRange) {
			// Clicking on an already-selected phrase - get the phrase text and toggle it
			const phraseWords = $.get(parts).filter((part, index) => part.type === 'word' && index >= phraseRange.start && index <= phraseRange.end).map((part) => part.content).join(' ');

			$$props.onWordClick(phraseWords.toLowerCase(), $$props.section);

			return; // Don't start dragging
		}

		$.set(isDragging, true);
		$.set(dragStartIndex, wordIndex, true);
		$.set(dragEndIndex, wordIndex, true);
	}

	function handleMouseEnter(wordIndex) {
		if (!flashcardMode()) return;

		// If dragging, update drag range
		if ($.get(isDragging)) {
			$.set(dragEndIndex, wordIndex, true);
		} else {
			// If not dragging, check if hovering over a selected phrase
			const phraseRange = getSelectedPhraseRange(wordIndex);

			$.set(hoveredPhraseRange, phraseRange, true);
		}
	}

	function handleMouseLeave() {
		if (!flashcardMode() || $.get(isDragging)) return;

		$.set(hoveredPhraseRange, null);
	}

	function handleMouseUp() {
		if (!flashcardMode() || !$$props.onWordClick || !$.get(isDragging)) return;

		if ($.get(dragStartIndex) !== null && $.get(dragEndIndex) !== null) {
			// Get the range of words (in text order)
			const start = Math.min($.get(dragStartIndex), $.get(dragEndIndex));

			const end = Math.max($.get(dragStartIndex), $.get(dragEndIndex));

			// Extract words in order from the parts array
			const selectedWords = $.get(parts).filter((part, index) => part.type === 'word' && index >= start && index <= end).map((part) => part.content).join(' ');

			if (selectedWords) {
				$$props.onWordClick(selectedWords.toLowerCase(), $$props.section);
			}
		}

		// Keep visual feedback briefly before clearing drag state
		// This ensures the last word stays green until it's marked as selected
		setTimeout(
			() => {
				$.set(isDragging, false);
				$.set(dragStartIndex, null);
				$.set(dragEndIndex, null);
			},
			50
		);
	}

	// Global mouse up handler to catch mouse up outside of words
	if (typeof window !== 'undefined') {
		$.user_effect(() => {
			if (flashcardMode()) {
				window.addEventListener('mouseup', handleMouseUp);

				return () => window.removeEventListener('mouseup', handleMouseUp);
			}
		});
	}

	var span = root_2();

	$.each(span, 21, () => $.get(parts), $.index, ($$anchor, part, index) => {
		const phraseRange = $.derived(() => getSelectedPhraseRange(index));
		const isInDragRange = $.derived(() => $.get(isDragging) && $.get(dragStartIndex) !== null && $.get(dragEndIndex) !== null && index >= Math.min($.get(dragStartIndex), $.get(dragEndIndex)) && index <= Math.max($.get(dragStartIndex), $.get(dragEndIndex)));
		const isInSelectedPhrase = $.derived(() => $.get(phraseRange) !== null);
		const isInHoveredPhrase = $.derived(() => $.get(hoveredPhraseRange) !== null && index >= $.get(hoveredPhraseRange).start && index <= $.get(hoveredPhraseRange).end);
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent_1 = ($$anchor) => {
				const isSelected = $.derived(() => selectedWords().has($.get(part).content.toLowerCase()) || $.get(isInSelectedPhrase));
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var text_1 = $.text();

						$.template_effect(($0) => $.set_text(text_1, $0), [
							() => console.log('[SelectableText] Debug - selectedWords:', Array.from(selectedWords()), 'selectedPhrases:', Array.from(selectedPhrases().keys()))
						]);

						$.append($$anchor, text_1);
					};

					$.if(node_1, ($$render) => {
						if (index === 0 && (selectedWords().size > 0 || selectedPhrases().size > 0)) $$render(consequent);
					});
				}

				var button = $.sibling(node_1, 2);
				var text_2 = $.only_child(button, true);

				$.template_effect(() => {
					$.set_class(
						button,
						1,
						`
					inline p-0 m-0 bg-transparent border-0 align-baseline
					${flashcardMode()
							? 'cursor-pointer border-b border-dashed border-blue-300 dark:border-blue-400/30 transition-all duration-150'
							: ''}
					${shouldJiggle() ? 'animate-jiggle' : ''}
					${!$.get(isInDragRange) && $.get(isSelected)
							? 'bg-blue-100 border-solid border-blue-500 font-medium dark:bg-blue-900/25 dark:border-blue-400'
							: ''}
					${$.get(isInDragRange)
							? '!bg-green-100 !border-solid !border-green-500 dark:!bg-green-900/25 dark:!border-green-400'
							: ''}
					${!$.get(isInDragRange) && !$.get(isSelected) && $.get(isInHoveredPhrase)
							? 'bg-blue-50 border-blue-400 dark:bg-blue-900/15 dark:border-blue-400/60'
							: ''}
					${!$.get(isInDragRange) && !$.get(isSelected) && !$.get(isInHoveredPhrase) && flashcardMode()
							? 'hover:bg-blue-50 hover:border-blue-500 dark:hover:bg-blue-900/15 dark:hover:border-blue-400/60'
							: ''}
				`,
						'svelte-5uclpr'
					);

					button.disabled = !flashcardMode();

					$.set_attribute(button, 'aria-label', flashcardMode()
						? `${$.get(isSelected) ? 'Deselect' : 'Select'} word "${$.get(part).content}" for flashcard`
						: undefined);

					$.set_attribute(button, 'aria-pressed', flashcardMode() ? $.get(isSelected) : undefined);
					$.set_attribute(button, 'tabindex', flashcardMode() ? 0 : -1);
					$.set_text(text_2, $.get(part).content);
				});

				$.delegated('mousedown', button, (e) => handleMouseDown(index, e));
				$.event('mouseenter', button, () => handleMouseEnter(index));
				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var span_1 = root_1();
				var text_3 = $.only_child(span_1, true);

				$.template_effect(() => {
					$.set_class(
						span_1,
						1,
						`
				inline
				${$.get(isInSelectedPhrase)
							? 'bg-blue-100 border-solid border-blue-500 dark:bg-blue-900/25 dark:border-blue-400'
							: ''}
				${$.get(isInDragRange)
							? '!bg-green-100 !border-solid !border-green-500 dark:!bg-green-900/25 dark:!border-green-400'
							: ''}
				${!$.get(isInDragRange) && !$.get(isInSelectedPhrase) && $.get(isInHoveredPhrase)
							? 'bg-blue-50 border-blue-400 dark:bg-blue-900/15 dark:border-blue-400/60'
							: ''}
			`,
						'svelte-5uclpr'
					);

					$.set_text(text_3, $.get(part).content);
				});

				$.append($$anchor, span_1);
			};

			$.if(node, ($$render) => {
				if ($.get(part).type === 'word') $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	});

	$.reset(span);
	$.event('mouseleave', span, handleMouseLeave);
	$.append($$anchor, span);
	$.pop();
}

$.delegate(['mousedown']);