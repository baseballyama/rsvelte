import * as $ from 'svelte/internal/server';

export default function SelectableText($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Section name for context tracking
		let {
			text,
			flashcardMode = false,
			selectedWords = new Set(),
			selectedPhrases = new Map(),
			shouldJiggle = false,
			onWordClick,
			section
		} = $$props;

		// Log whenever selectedPhrases changes
		// Drag selection state
		let isDragging = false;

		let dragStartIndex = null;
		let dragEndIndex = null;
		let hoveredPhraseRange = null;

		// Check if a word/position is part of any selected phrase
		// Returns the range [startIndex, endIndex] if the position is in a selected phrase, or null
		function getSelectedPhraseRange(checkIndex) {
			// Check all selected phrases to see if this position falls within one
			for (const [phraseText, phraseData] of selectedPhrases.entries()) {
				const phraseWords = phraseText.split(' ');

				// Try to find this phrase in the parts array
				for (let startIdx = 0; startIdx < parts().length; startIdx++) {
					// Only start matching from word positions
					if (parts()[startIdx].type !== 'word') continue;

					let wordIdx = 0;
					let currentIdx = startIdx;
					let firstWordIdx = startIdx;
					let lastWordIdx = startIdx;

					// Try to match all words in the phrase sequentially
					while (wordIdx < phraseWords.length && currentIdx < parts().length) {
						if (parts()[currentIdx].type === 'word') {
							if (parts()[currentIdx].content.toLowerCase() === phraseWords[wordIdx]) {
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
		const cleanedText = $.derived(() => text.replace(/\[[^\]]+\]/g, '').// Remove citation markers
		replace(/\s+/g, ' ').// Normalize multiple spaces to single space
		replace(/\s+([.,;:!?)])/g, '$1').// Remove space before punctuation
		trim());

		const parts = $.derived(() => parseText(cleanedText()));

		function handleMouseDown(wordIndex, event) {
			if (!flashcardMode || !onWordClick) return;

			event.preventDefault();
			event.stopPropagation();

			// Check if this word is part of an existing phrase
			const phraseRange = getSelectedPhraseRange(wordIndex);

			if (phraseRange) {
				// Clicking on an already-selected phrase - get the phrase text and toggle it
				const phraseWords = parts().filter((part, index) => part.type === 'word' && index >= phraseRange.start && index <= phraseRange.end).map((part) => part.content).join(' ');

				onWordClick(phraseWords.toLowerCase(), section);

				return; // Don't start dragging
			}

			isDragging = true;
			dragStartIndex = wordIndex;
			dragEndIndex = wordIndex;
		}

		function handleMouseEnter(wordIndex) {
			if (!flashcardMode) return;

			// If dragging, update drag range
			if (isDragging) {
				dragEndIndex = wordIndex;
			} else {
				// If not dragging, check if hovering over a selected phrase
				const phraseRange = getSelectedPhraseRange(wordIndex);

				hoveredPhraseRange = phraseRange;
			}
		}

		function handleMouseLeave() {
			if (!flashcardMode || isDragging) return;

			hoveredPhraseRange = null;
		}

		function handleMouseUp() {
			if (!flashcardMode || !onWordClick || !isDragging) return;

			if (dragStartIndex !== null && dragEndIndex !== null) {
				// Get the range of words (in text order)
				const start = Math.min(dragStartIndex, dragEndIndex);

				const end = Math.max(dragStartIndex, dragEndIndex);

				// Extract words in order from the parts array
				const selectedWords = parts().filter((part, index) => part.type === 'word' && index >= start && index <= end).map((part) => part.content).join(' ');

				if (selectedWords) {
					onWordClick(selectedWords.toLowerCase(), section);
				}
			}

			// Keep visual feedback briefly before clearing drag state
			// This ensures the last word stays green until it's marked as selected
			setTimeout(
				() => {
					isDragging = false;
					dragStartIndex = null;
					dragEndIndex = null;
				},
				50
			);
		}

		// Global mouse up handler to catch mouse up outside of words
		if (typeof window !== 'undefined') {}

		$$renderer.push(`<span class="select-none svelte-5uclpr" role="region" aria-label="Selectable text for flashcards"><!--[-->`);

		const each_array = $.ensure_array_like(parts());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let part = each_array[index];
			const phraseRange = getSelectedPhraseRange(index);
			const isInDragRange = isDragging && dragStartIndex !== null && dragEndIndex !== null && index >= Math.min(dragStartIndex, dragEndIndex) && index <= Math.max(dragStartIndex, dragEndIndex);
			const isInSelectedPhrase = phraseRange !== null;
			const isInHoveredPhrase = hoveredPhraseRange !== null && index >= hoveredPhraseRange.start && index <= hoveredPhraseRange.end;

			if (part.type === 'word') {
				$$renderer.push('<!--[0-->');

				const isSelected = selectedWords.has(part.content.toLowerCase()) || isInSelectedPhrase;

				if (index === 0 && (selectedWords.size > 0 || selectedPhrases.size > 0)) {
					$$renderer.push(`<!--[0-->${$.escape(console.log('[SelectableText] Debug - selectedWords:', Array.from(selectedWords), 'selectedPhrases:', Array.from(selectedPhrases.keys())))}`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <button type="button"${$.attr_class(
					`
					inline p-0 m-0 bg-transparent border-0 align-baseline
					${flashcardMode
						? 'cursor-pointer border-b border-dashed border-blue-300 dark:border-blue-400/30 transition-all duration-150'
						: ''}
					${shouldJiggle ? 'animate-jiggle' : ''}
					${!isInDragRange && isSelected
						? 'bg-blue-100 border-solid border-blue-500 font-medium dark:bg-blue-900/25 dark:border-blue-400'
						: ''}
					${isInDragRange
						? '!bg-green-100 !border-solid !border-green-500 dark:!bg-green-900/25 dark:!border-green-400'
						: ''}
					${!isInDragRange && !isSelected && isInHoveredPhrase
						? 'bg-blue-50 border-blue-400 dark:bg-blue-900/15 dark:border-blue-400/60'
						: ''}
					${!isInDragRange && !isSelected && !isInHoveredPhrase && flashcardMode
						? 'hover:bg-blue-50 hover:border-blue-500 dark:hover:bg-blue-900/15 dark:hover:border-blue-400/60'
						: ''}
				`,
					'svelte-5uclpr'
				)}${$.attr('disabled', !flashcardMode, true)}${$.attr('aria-label', flashcardMode
					? `${isSelected ? 'Deselect' : 'Select'} word "${part.content}" for flashcard`
					: undefined)}${$.attr('aria-pressed', flashcardMode ? isSelected : undefined)}${$.attr('tabindex', flashcardMode ? 0 : -1)}>${$.escape(part.content)}</button>`);
			} else {
				$$renderer.push(`<!--[-1--><span${$.attr_class(
					`
				inline
				${isInSelectedPhrase
						? 'bg-blue-100 border-solid border-blue-500 dark:bg-blue-900/25 dark:border-blue-400'
						: ''}
				${isInDragRange
						? '!bg-green-100 !border-solid !border-green-500 dark:!bg-green-900/25 dark:!border-green-400'
						: ''}
				${!isInDragRange && !isInSelectedPhrase && isInHoveredPhrase
						? 'bg-blue-50 border-blue-400 dark:bg-blue-900/15 dark:border-blue-400/60'
						: ''}
			`,
					'svelte-5uclpr'
				)}>${$.escape(part.content)}</span>`);
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></span>`);
	});
}