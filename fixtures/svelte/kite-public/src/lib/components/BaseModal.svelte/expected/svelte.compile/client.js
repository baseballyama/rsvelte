import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { scrollLock } from '$lib/utils/scrollLock';
import 'overlayscrollbars/overlayscrollbars.css';
import { onDestroy, onMount } from 'svelte';
import { fade, fly } from 'svelte/transition';

var root = $.from_html(`<h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100"> </h2>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<button class="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 focus-visible-ring touch-manipulation min-h-11 min-w-11 flex items-center justify-center"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 shrink-0 relative z-10 bg-white dark:bg-gray-800"><!> <!></div>`);
var root_4 = $.from_html(`<div><div role="dialog" aria-modal="true" tabindex="-1"><!> <div class="modal-content flex-1 overflow-y-auto svelte-5hkr9u" data-overlayscrollbars-initialize=""><!></div></div></div>`);

export default function BaseModal($$anchor, $$props) {
	$.push($$props, true);

	// Props
	let isOpen = $.prop($$props, 'isOpen', 3, false),
		title = $.prop($$props, 'title', 3, ''),
		size = $.prop($$props, 'size', 3, 'md'),
		position = $.prop($$props, 'position', 3, 'center'),
		closeOnBackdrop = $.prop($$props, 'closeOnBackdrop', 3, true),
		closeOnEscape = $.prop($$props, 'closeOnEscape', 3, true),
		showCloseButton = $.prop($$props, 'showCloseButton', 3, true),
		lockScroll = $.prop($$props, 'lockScroll', 3, true),
		zIndex = $.prop($$props, 'zIndex', 3, 1000),
		className = $.prop($$props, 'class', 3, '');

	// Modal element references
	let modalElement = $.state(void 0);

	let contentElement = $.state(void 0);
	let previousActiveElement = null;

	// OverlayScrollbars setup
	let [initialize] = useOverlayScrollbars({
		defer: true,
		options: {
			scrollbars: { autoHide: 'scroll', theme: 'os-theme-dark os-theme-light' }
		}
	});

	// Size classes
	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-2xl',
		lg: 'max-w-4xl',
		xl: 'max-w-6xl',
		full: 'max-w-full mx-4'
	};

	// Position classes
	const positionClasses = {
		center: 'items-center justify-center',
		top: 'items-start justify-center pt-16',
		bottom: 'items-end justify-center'
	};

	// Transition config
	const backdropTransition = { duration: 150 };

	const modalTransition = $.derived(() => position() === 'bottom'
		? { y: 200, duration: 200 }
		: position() === 'top' ? { y: -50, duration: 200 } : { duration: 200 });

	// Handle backdrop click
	function handleBackdropClick(e) {
		if (closeOnBackdrop() && e.target === e.currentTarget) {
			$$props.onClose();
		}
	}

	// Handle escape key
	function handleKeydown(e) {
		if (closeOnEscape() && e.key === 'Escape' && isOpen()) {
			e.preventDefault();
			$$props.onClose();
		}
	}

	// Focus management
	function trapFocus(e) {
		if (!$.get(modalElement) || e.key !== 'Tab') return;

		const focusableElements = $.get(modalElement).querySelectorAll('button:not([disabled]), [href]:not([disabled]), input:not([disabled]), ' + 'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])');

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		if (e.shiftKey && document.activeElement === firstElement) {
			e.preventDefault();
			lastElement.focus();
		} else if (!e.shiftKey && document.activeElement === lastElement) {
			e.preventDefault();
			firstElement.focus();
		}
	}

	// Manage scroll lock and focus
	$.user_effect(() => {
		if (!browser) return;

		if (isOpen()) {
			// Store current active element
			previousActiveElement = document.activeElement;

			// Lock scroll if enabled
			if (lockScroll()) {
				scrollLock.lock();
			}

			// Focus modal after a tick
			setTimeout(
				() => {
					if ($.get(modalElement)) {
						$.get(modalElement).focus();
					}
				},
				50
			);

			return () => {
				if (lockScroll()) {
					scrollLock.unlock();
				}

				// Restore focus without scrolling
				if (previousActiveElement && previousActiveElement instanceof HTMLElement) {
					previousActiveElement.focus({ preventScroll: true });
				}
			};
		}
	});

	// Initialize OverlayScrollbars on content element
	$.user_effect(() => {
		if ($.get(contentElement) && isOpen()) {
			initialize($.get(contentElement));
		}
	});

	var fragment = $.comment();

	$.event('keydown', $.window, handleKeydown);

	var node = $.first_child(fragment);

	{
		var consequent_3 = ($$anchor) => {
			var div = root_4();
			var div_1 = $.child(div);
			var node_1 = $.child(div_1);

			{
				var consequent_2 = ($$anchor) => {
					var div_2 = root_3();
					var node_2 = $.child(div_2);

					{
						var consequent = ($$anchor) => {
							var h2 = root();
							var text = $.only_child(h2, true);

							$.template_effect(() => $.set_text(text, title()));
							$.append($$anchor, h2);
						};

						var alternate = ($$anchor) => {
							var div_3 = root_1();

							$.append($$anchor, div_3);
						};

						$.if(node_2, ($$render) => {
							if (title()) $$render(consequent); else $$render(alternate, -1);
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						var consequent_1 = ($$anchor) => {
							var button = root_2();

							$.template_effect(($0) => $.set_attribute(button, 'aria-label', $0), [() => s("ui.close") || "Close"]);

							$.delegated('click', button, function (...$$args) {
								$$props.onClose?.apply(this, $$args);
							});

							$.append($$anchor, button);
						};

						$.if(node_3, ($$render) => {
							if (showCloseButton()) $$render(consequent_1);
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_1, ($$render) => {
					if (title() || showCloseButton()) $$render(consequent_2);
				});
			}

			var div_4 = $.sibling(node_1, 2);
			var node_4 = $.child(div_4);

			$.snippet(node_4, () => $$props.children ?? $.noop);
			$.reset(div_4);
			$.bind_this(div_4, ($$value) => $.set(contentElement, $$value), () => $.get(contentElement));
			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(modalElement, $$value), () => $.get(modalElement));
			$.reset(div);

			$.template_effect(() => {
				$.set_class(div, 1, `fixed inset-0 bg-black/50 flex ${positionClasses[position()] ?? ''} p-0 sm:p-4`, 'svelte-5hkr9u');
				$.set_style(div, `z-index: ${zIndex() ?? ''}`);
				$.set_class(div_1, 1, `relative w-full h-full sm:h-auto ${sizeClasses[size()] ?? ''} ${position() === 'bottom' ? 'rounded-t-2xl' : 'sm:rounded-lg'} bg-white shadow-xl dark:bg-gray-800 flex flex-col ${className() ?? ''}`, 'svelte-5hkr9u');
				$.set_attribute(div_1, 'aria-label', $$props.ariaLabel || title() || "Modal dialog");
				$.set_attribute(div_1, 'aria-labelledby', title() ? "modal-title" : undefined);
			});

			$.delegated('click', div, handleBackdropClick);
			$.delegated('keydown', div_1, trapFocus);
			$.delegated('click', div_1, (e) => e.stopPropagation());
			$.transition(3, div_1, () => fly, () => $.get(modalTransition));
			$.transition(3, div, () => fade, () => backdropTransition);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (isOpen()) $$render(consequent_3);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);