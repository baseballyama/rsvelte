import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { keyboardNavigation } from '$lib/stores/keyboardNavigation.svelte';

export default function KeyboardNavigationHandler($$anchor, $$props) {
	$.push($$props, true);

	// Array of categories for navigation
	let showSearchModal = $.prop($$props, 'showSearchModal', 15, false);

	// Track last key press for gg combo
	let lastKeyTime = 0;

	let lastKey = '';

	function scrollToSelectedStory() {
		if (!keyboardNavigation.hasSelection) return;

		// Use setTimeout to ensure DOM has updated
		setTimeout(
			() => {
				const storyElement = document.querySelector(`[data-story-index="${keyboardNavigation.selectedIndex}"]`);

				if (storyElement) {
					storyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
			},
			50
		);
	}

	function handleGlobalKeyDown(event) {
		// Don't handle shortcuts if user is typing in an input/textarea or if modals are open (except help)
		const target = event.target;

		const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

		// Allow Escape and ? even when inputs are focused
		const allowWhenInputFocused = event.key === 'Escape' || event.key === '?';

		if (isInputFocused && !allowWhenInputFocused) {
			return;
		}

		// Cmd+K or Ctrl+K to toggle search
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();

			if ($$props.onToggleSearchModal) {
				$$props.onToggleSearchModal();
			} else {
				showSearchModal(!showSearchModal());
			}

			return;
		}

		// Handle ? to toggle help (works everywhere)
		if (event.key === '?') {
			event.preventDefault();
			keyboardNavigation.toggleHelp();

			return;
		}

		// Don't handle vim-like shortcuts if certain modals are open
		if ($$props.settingsModalOpen || $$props.showSourceOverlay || $$props.wikipediaPopupVisible) {
			return;
		}

		// Close help with Escape
		if (event.key === 'Escape' && keyboardNavigation.showHelp) {
			event.preventDefault();
			keyboardNavigation.closeHelp();

			return;
		}

		// Clear selection with Escape
		if (event.key === 'Escape' && keyboardNavigation.hasSelection) {
			event.preventDefault();
			keyboardNavigation.clearSelection();

			return;
		}

		// h - Previous category (don't trigger if modifier keys are pressed)
		if (event.key === 'h' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && $$props.onCategoryChange && $$props.categories.length > 0) {
			event.preventDefault();

			const currentIndex = $$props.categories.findIndex((cat) => cat.id === $$props.currentCategory);

			if (currentIndex > 0) {
				$$props.onCategoryChange($$props.categories[currentIndex - 1].id);
			} else if (currentIndex === 0) {
				// Wrap around to last category
				$$props.onCategoryChange($$props.categories[$$props.categories.length - 1].id);
			}

			return;
		}

		// l - Next category (don't trigger if modifier keys are pressed)
		if (event.key === 'l' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && $$props.onCategoryChange && $$props.categories.length > 0) {
			event.preventDefault();

			const currentIndex = $$props.categories.findIndex((cat) => cat.id === $$props.currentCategory);

			if (currentIndex >= 0 && currentIndex < $$props.categories.length - 1) {
				$$props.onCategoryChange($$props.categories[currentIndex + 1].id);
			} else if (currentIndex === $$props.categories.length - 1) {
				// Wrap around to first category
				$$props.onCategoryChange($$props.categories[0].id);
			}

			return;
		}

		// Don't handle story navigation shortcuts on OnThisDay page
		if ($$props.currentCategory === 'onthisday') {
			return;
		}

		// Handle gg (go to first story)
		const now = Date.now();

		if (event.key === 'g') {
			if (lastKey === 'g' && now - lastKeyTime < 500) {
				event.preventDefault();
				keyboardNavigation.selectStory(0);
				lastKey = '';
				scrollToSelectedStory();

				return;
			}

			lastKey = 'g';
			lastKeyTime = now;

			return;
		}

		lastKey = event.key;

		// j - Next story
		if (event.key === 'j') {
			event.preventDefault();
			keyboardNavigation.selectNext();
			scrollToSelectedStory();

			return;
		}

		// k - Previous story
		if (event.key === 'k') {
			event.preventDefault();
			keyboardNavigation.selectPrevious();
			scrollToSelectedStory();

			return;
		}

		// G - Go to last story
		if (event.key === 'G') {
			event.preventDefault();

			if ($$props.stories.length > 0) {
				keyboardNavigation.selectStory($$props.stories.length - 1);
				scrollToSelectedStory();
			}

			return;
		}

		// Enter - Expand/collapse selected story
		if (event.key === 'Enter' && keyboardNavigation.hasSelection) {
			event.preventDefault();

			const story = $$props.stories[keyboardNavigation.selectedIndex];

			if (story) {
				$$props.onStoryToggle(story.id || story.cluster_number?.toString() || story.title);
			}

			return;
		}

		// o - Open (expand) selected story
		if (event.key === 'o' && keyboardNavigation.hasSelection) {
			event.preventDefault();

			const story = $$props.stories[keyboardNavigation.selectedIndex];

			if (story) {
				const storyId = story.id || story.cluster_number?.toString() || story.title;

				if (!$$props.expandedStories[storyId]) {
					$$props.onStoryToggle(storyId);
				}
			}

			return;
		}

		// x - Close (collapse) selected story
		if (event.key === 'x' && keyboardNavigation.hasSelection) {
			event.preventDefault();

			const story = $$props.stories[keyboardNavigation.selectedIndex];

			if (story) {
				const storyId = story.id || story.cluster_number?.toString() || story.title;

				if ($$props.expandedStories[storyId]) {
					$$props.onStoryToggle(storyId);
				}
			}

			return;
		}

		// m - Mark as read/unread
		if (event.key === 'm' && keyboardNavigation.hasSelection && $$props.onToggleReadStatus) {
			event.preventDefault();
			$$props.onToggleReadStatus(keyboardNavigation.selectedIndex);

			return;
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleGlobalKeyDown);

		return () => window.removeEventListener('keydown', handleGlobalKeyDown);
	});

	// Update keyboard navigation state when stories change
	$.user_effect(() => {
		keyboardNavigation.setTotalStories($$props.stories.length);
	});

	// Reset keyboard navigation when changing categories
	$.user_effect(() => {
		if ($$props.currentCategory) {
			keyboardNavigation.reset();
		}
	});

	$.pop();
}