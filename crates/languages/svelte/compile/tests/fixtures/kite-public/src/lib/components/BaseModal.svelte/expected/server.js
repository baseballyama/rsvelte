import * as $ from 'svelte/internal/server';
import { useOverlayScrollbars } from 'overlayscrollbars-svelte';
import { browser } from '$app/environment';
import { s } from '$lib/client/localization.svelte';
import { scrollLock } from '$lib/utils/scrollLock';
import 'overlayscrollbars/overlayscrollbars.css';
import { onDestroy, onMount } from 'svelte';
import { fade, fly } from 'svelte/transition';

export default function BaseModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Props
		let {
			isOpen = false,
			onClose,
			title = '',
			size = 'md',
			position = 'center',
			closeOnBackdrop = true,
			closeOnEscape = true,
			showCloseButton = true,
			lockScroll = true,
			zIndex = 1000,
			ariaLabel,
			class: className = '',
			children
		} = $$props;

		// Modal element references
		let modalElement = void 0;

		let contentElement = void 0;
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

		const modalTransition = $.derived(() => position === 'bottom'
			? { y: 200, duration: 200 }
			: position === 'top' ? { y: -50, duration: 200 } : { duration: 200 });

		// Handle backdrop click
		function handleBackdropClick(e) {
			if (closeOnBackdrop && e.target === e.currentTarget) {
				onClose();
			}
		}

		// Handle escape key
		function handleKeydown(e) {
			if (closeOnEscape && e.key === 'Escape' && isOpen) {
				e.preventDefault();
				onClose();
			}
		}

		// Focus management
		function trapFocus(e) {
			if (!modalElement || e.key !== 'Tab') return;

			const focusableElements = modalElement.querySelectorAll('button:not([disabled]), [href]:not([disabled]), input:not([disabled]), ' + 'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])');

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

		if (// Manage scroll lock and focus
		// Store current active element
		// Lock scroll if enabled
		// Focus modal after a tick
		// Restore focus without scrolling
		// Initialize OverlayScrollbars on content element
		isOpen) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`fixed inset-0 bg-black/50 flex ${$.stringify(positionClasses[position])} p-0 sm:p-4`, 'svelte-5hkr9u')}${$.attr_style(`z-index: ${$.stringify(zIndex)}`)}><div${$.attr_class(`relative w-full h-full sm:h-auto ${$.stringify(sizeClasses[size])} ${position === 'bottom' ? 'rounded-t-2xl' : 'sm:rounded-lg'} bg-white shadow-xl dark:bg-gray-800 flex flex-col ${$.stringify(className)}`, 'svelte-5hkr9u')} role="dialog" aria-modal="true"${$.attr('aria-label', ariaLabel || title || "Modal dialog")}${$.attr('aria-labelledby', title ? "modal-title" : undefined)} tabindex="-1">`);

			if (title || showCloseButton) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 shrink-0 relative z-10 bg-white dark:bg-gray-800">`);

				if (title) {
					$$renderer.push(`<!--[0--><h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">${$.escape(title)}</h2>`);
				} else {
					$$renderer.push(`<!--[-1--><div></div>`);
				}

				$$renderer.push(`<!--]--> `);

				if (showCloseButton) {
					$$renderer.push(`<!--[0--><button class="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 focus-visible-ring touch-manipulation min-h-11 min-w-11 flex items-center justify-center"${$.attr('aria-label', s("ui.close") || "Close")}><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="modal-content flex-1 overflow-y-auto svelte-5hkr9u" data-overlayscrollbars-initialize="">`);
			children?.($$renderer);
			$$renderer.push(`<!----></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}