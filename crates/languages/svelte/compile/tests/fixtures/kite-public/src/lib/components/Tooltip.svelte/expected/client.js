import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy, onMount } from 'svelte';
import { fade } from 'svelte/transition';
import Portal from 'svelte-portal';
import { browser } from '$app/environment';

var root = $.from_html(`<div class="svelte-tooltip z-tooltip max-w-xs overflow-hidden rounded-md bg-gray-900 dark:bg-gray-800 px-3 py-2 text-xs text-white shadow-lg svelte-11extwn" style="position: fixed; pointer-events: none;"><div class="whitespace-pre-line text-left svelte-11extwn"> </div></div>`);
var root_1 = $.from_html(`<div tabindex="-1" role="none"><!></div> <!>`, 1);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * Props
	 */
	let text = $.prop($$props, 'text', 3, ''),
		position = $.prop($$props, 'position', 3, 'top'),
		disabled = $.prop($$props, 'disabled', 3, false),
		className = $.prop($$props, 'class', 3, '');

	/**
	 * Reactive state
	 */
	let visible = $.state(false);

	let tooltipElement = $.state(null);
	let triggerElement = $.state(null);
	let timeoutId;
	let mobileTimeoutId;
	let resizeObserver;
	let currentMouseX = 0;
	let currentMouseY = 0;
	let wasClicked = $.state(false);
	let isTouchDevice = $.state(false);
	const SHOW_DELAY = 0; // Delay before showing tooltip in ms

	// Add reactive statement to update position when text changes
	$.user_effect(() => {
		if ($.get(visible) && text()) {
			// Wait for next frame to ensure DOM is updated
			requestAnimationFrame(updatePosition);
		}
	});

	// Track previous text to detect meaningful changes
	let previousText = $.state('');

	// Show updated tooltip when text changes significantly after a click
	$.user_effect(() => {
		if (text() && $.get(previousText) && text() !== $.get(previousText) && $.get(wasClicked)) {
			// Text changed after a click - show the updated tooltip
			$.set(wasClicked, false // Reset clicked state
			);

			$.set(visible, true);
			requestAnimationFrame(updatePosition);
		}

		$.set(previousText, text());
	});

	$.user_effect(() => {
		if (disabled()) {
			$.set(visible, false);
		}
	});

	function isMouseOverTrigger() {
		if (!$.get(triggerElement)) return false;

		const rect = $.get(triggerElement).getBoundingClientRect();

		return currentMouseX >= rect.left && currentMouseX <= rect.right && currentMouseY >= rect.top && currentMouseY <= rect.bottom;
	}

	function handleMouseMove(event) {
		currentMouseX = event.clientX;
		currentMouseY = event.clientY;
	}

	function handleScroll() {
		// On mobile, hide tooltip when scrolling
		if ($.get(isTouchDevice) && $.get(visible)) {
			$.set(visible, false);
		}
	}

	function handleDocumentClick(event) {
		// If tooltip is visible and click is outside the trigger element, hide the tooltip
		if ($.get(visible) && $.get(triggerElement) && !$.get(triggerElement).contains(event.target)) {
			$.set(visible, false);
			$.set(wasClicked, false // Reset clicked state when clicking elsewhere
			);
		}
	}

	// Helper function to check if the target element is a Select or is inside a Select
	function isSelectElement(target) {
		// Check if the element itself or any parent is a select element or has a select-related class
		return Boolean(target.closest('select, [class*="select"], [role="listbox"], .svelte-select'));
	}

	function handleTriggerClick(event) {
		// Prevent the click from being handled by the document click handler
		event.stopPropagation();

		// Get target element information
		const target = event.target;

		// Check if we're clicking on a Select element or its children
		if (isSelectElement(target)) {
			// Don't show tooltip for selects, let the event propagate
			return;
		}

		// Don't show tooltip if the tooltip itself is disabled
		if (disabled()) {
			return;
		}

		// On touch devices, simple toggle behavior
		if ($.get(isTouchDevice)) {
			// Clear any existing timeout
			if (mobileTimeoutId) {
				clearTimeout(mobileTimeoutId);
				mobileTimeoutId = 0;
			}

			// Simple toggle - if visible, hide it; if hidden, show it
			if ($.get(visible)) {
				$.set(visible, false);
			} else {
				$.set(visible, true);

				// Update position immediately
				requestAnimationFrame(updatePosition);
			}

			return;
		}

		// For mouse devices, always close the tooltip when clicking the trigger
		$.set(visible, false);

		$.set(wasClicked, true // Set clicked state to prevent tooltip from showing on mouseenter again until mouse leaves
		);
	}

	function handleTouchStart(event) {
		// Don't process if the tooltip itself is disabled
		if (disabled()) return;

		// Check if we're touching a Select element or its children
		if (isSelectElement(event.target)) {
			// Don't show tooltip for selects
			return;
		}
	}

	function handleTouchEnd(event) {
		// Don't process if the tooltip itself is disabled
		if (disabled()) return;

		// Check if we're touching a Select element or its children
		if (isSelectElement(event.target)) {
			// Don't show tooltip for selects
			return;
		}
	}

	onMount(() => {
		// Detect if we're on a touch device
		if (browser) {
			$.set(isTouchDevice, window.matchMedia('(pointer: coarse)').matches, true);
			window.addEventListener('mousemove', handleMouseMove);

			// Add document click listener to close tooltip when clicking elsewhere
			window.addEventListener('click', handleDocumentClick, true);

			// Add scroll listener to hide tooltip when scrolling (mobile only)
			window.addEventListener('scroll', handleScroll, true);
		}

		// Create resize observer to update position when trigger element resizes
		resizeObserver = new ResizeObserver(() => {
			if ($.get(visible)) {
				if (!isMouseOverTrigger()) {
					$.set(visible, false);
				} else {
					updatePosition();
				}
			}
		});

		if ($.get(triggerElement)) {
			resizeObserver.observe($.get(triggerElement));
		}
	});

	onDestroy(() => {
		// Clean up
		if (browser) {
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('click', handleDocumentClick, true);
			window.removeEventListener('scroll', handleScroll, true);
		}

		if (resizeObserver) {
			resizeObserver.disconnect();
		}

		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		if (mobileTimeoutId) {
			clearTimeout(mobileTimeoutId);
		}

		$.set(visible, false);
	});

	/**
	 * Positions the tooltip (portaled to <body>) relative to the trigger
	 */
	function updatePosition() {
		if (!$.get(tooltipElement) || !$.get(triggerElement)) return;

		const triggerRect = $.get(triggerElement).getBoundingClientRect();
		const tooltipRect = $.get(tooltipElement).getBoundingClientRect();
		let left = 0;
		let top = 0;

		// Calculate position relative to viewport
		switch (position()) {
			case 'top':
				left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
				top = triggerRect.top - tooltipRect.height - 8;
				break;

			case 'bottom':
				left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
				top = triggerRect.bottom + 8;
				break;

			case 'left':
				left = triggerRect.left - tooltipRect.width - 8;
				top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
				break;

			case 'right':
				left = triggerRect.right + 8;
				top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
				break;
		}

		// Keep tooltip in the viewport with some padding
		const padding = 8;

		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		if (left < padding) {
			left = padding;
		} else if (left + tooltipRect.width > viewportWidth - padding) {
			left = viewportWidth - tooltipRect.width - padding;
		}

		if (top < padding) {
			// If there's no space above, force bottom
			if (position() === 'top') {
				top = triggerRect.bottom + 8;
			} else {
				top = padding;
			}
		} else if (top + tooltipRect.height > viewportHeight - padding) {
			// If there's no space below, force top
			if (position() === 'bottom') {
				top = triggerRect.top - tooltipRect.height - 8;
			} else {
				top = viewportHeight - tooltipRect.height - padding;
			}
		}

		$.get(tooltipElement).style.position = 'fixed';
		$.get(tooltipElement).style.left = `${left}px`;
		$.get(tooltipElement).style.top = `${top}px`;
	}

	function handleMouseEnter() {
		// Don't show tooltip if disabled, was just clicked, or user is scrolling
		if (disabled() || $.get(wasClicked)) return;

		// For touch devices, we rely on the click handler to show tooltips
		if ($.get(isTouchDevice)) return;

		timeoutId = window.setTimeout(
			() => {
				$.set(visible, true);

				// Wait for next frame so <div> is actually in the DOM before measuring
				requestAnimationFrame(updatePosition);
			},
			SHOW_DELAY
		);
	}

	function handleMouseLeave() {
		clearTimeout(timeoutId);

		// Hide tooltip and reset clicked state
		$.set(visible, false);

		$.set(wasClicked, false);
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => $.set(triggerElement, $$value), () => $.get(triggerElement));

	var node_1 = $.sibling(div, 2);

	{
		var consequent = ($$anchor) => {
			Portal($$anchor, {
				target: 'body',
				children: ($$anchor, $$slotProps) => {
					var div_1 = root();
					var div_2 = $.child(div_1);
					var text_1 = $.only_child(div_2, true);

					$.reset(div_1);
					$.bind_this(div_1, ($$value) => $.set(tooltipElement, $$value), () => $.get(tooltipElement));
					$.template_effect(() => $.set_text(text_1, text()));
					$.transition(3, div_1, () => fade, () => ({ duration: 150 }));
					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(visible) && text() && !disabled()) $$render(consequent);
		});
	}

	$.template_effect(() => $.set_class(div, 1, $.clsx(className()), 'svelte-11extwn'));
	$.event('mouseenter', div, handleMouseEnter);
	$.event('mouseleave', div, handleMouseLeave);
	$.event('focus', div, handleMouseEnter);
	$.event('blur', div, handleMouseLeave);
	$.delegated('click', div, handleTriggerClick);
	$.delegated('touchstart', div, handleTouchStart, void 0, true);
	$.delegated('touchend', div, handleTouchEnd);

	$.delegated('keydown', div, (e) => {
		if (e.key === "Enter" || e.key === " ") {
			handleTriggerClick(e);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'touchstart', 'touchend', 'keydown']);