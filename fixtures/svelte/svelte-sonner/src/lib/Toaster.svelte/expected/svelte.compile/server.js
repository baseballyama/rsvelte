import * as $ from 'svelte/internal/server';
import { onMount, untrack } from 'svelte';
import { SonnerState, toastState } from './toast-state.svelte';
import Toast from './Toast.svelte';
import SuccessIcon from './icons/SuccessIcon.svelte';
import ErrorIcon from './icons/ErrorIcon.svelte';
import WarningIcon from './icons/WarningIcon.svelte';
import InfoIcon from './icons/InfoIcon.svelte';
import CloseIcon from './icons/CloseIcon.svelte';
import { sonnerContext } from './internal/ctx.js';
import { on } from 'svelte/events';

const VISIBLE_TOASTS_AMOUNT = 3;
const VIEWPORT_OFFSET = '24px';
const MOBILE_VIEWPORT_OFFSET = '16px';
const TOAST_LIFETIME = 4000;
const TOAST_WIDTH = 356;
const GAP = 14;
const DARK = 'dark';
const LIGHT = 'light';

function getOffsetObject(defaultOffset, mobileOffset) {
	const styles = {};

	[defaultOffset, mobileOffset].forEach((offset, index) => {
		const isMobile = index === 1;
		const prefix = isMobile ? '--mobile-offset' : '--offset';
		const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

		function assignAll(offset) {
			['top', 'right', 'bottom', 'left'].forEach((key) => {
				styles[`${prefix}-${key}`] = typeof offset === 'number' ? `${offset}px` : offset;
			});
		}

		if (typeof offset === 'number' || typeof offset === 'string') {
			assignAll(offset);
		} else if (typeof offset === 'object') {
			['top', 'right', 'bottom', 'left'].forEach((key) => {
				const value = offset[key];

				if (value === undefined) {
					styles[`${prefix}-${key}`] = defaultValue;
				} else {
					styles[`${prefix}-${key}`] = typeof value === 'number' ? `${value}px` : value;
				}
			});
		} else {
			assignAll(defaultValue);
		}
	});

	return styles;
}

export default function Toaster($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function getInitialTheme(t) {
			if (t !== 'system') return t;

			if (typeof window !== 'undefined') {
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					return DARK;
				}

				return LIGHT;
			}

			return LIGHT;
		}

		let {
			id,
			invert = false,
			position = 'bottom-right',
			hotkey = ['altKey', 'KeyT'],
			expand = false,
			closeButton = false,
			offset = VIEWPORT_OFFSET,
			mobileOffset = MOBILE_VIEWPORT_OFFSET,
			theme = 'light',
			richColors = false,
			duration = TOAST_LIFETIME,
			visibleToasts = VISIBLE_TOASTS_AMOUNT,
			toastOptions = {},
			dir = 'auto',
			gap = GAP,
			swipeDirections,
			pauseWhenPageIsHidden = false,
			loadingIcon: loadingIconProp,
			successIcon: successIconProp,
			errorIcon: errorIconProp,
			warningIcon: warningIconProp,
			closeIcon: closeIconProp,
			infoIcon: infoIconProp,
			containerAriaLabel = 'Notifications',
			class: className,
			closeButtonAriaLabel = 'Close toast',
			onblur,
			onfocus,
			onmouseenter,
			onmousemove,
			onmouseleave,
			ondragend,
			onpointerdown,
			onpointerup,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function getDocumentDirection() {
			if (dir !== 'auto') return dir;
			if (typeof window === 'undefined') return 'ltr';
			if (typeof document === 'undefined') return 'ltr'; // For Fresh purpose

			const dirAttribute = document.documentElement.getAttribute('dir');

			if (dirAttribute === 'auto' || !dirAttribute) {
				untrack(() => dir = window.getComputedStyle(document.documentElement).direction ?? 'ltr');

				return dir;
			}

			untrack(() => dir = dirAttribute);

			return dirAttribute;
		}

		// The slice of the shared toast state this toaster renders: an id-less toaster
		// shows only toasts without a toasterId (upstream sonner semantics).
		const filteredToasts = $.derived(() => id
			? toastState.toasts.filter((toast) => toast.toasterId === id)
			: toastState.toasts.filter((toast) => !toast.toasterId));

		const possiblePositions = $.derived(() => Array.from(new Set([
			position,
			...filteredToasts().filter((toast) => toast.position).map((toast) => toast.position)
		].filter(Boolean))));

		let expanded = false;
		let interacting = false;
		let actualTheme = getInitialTheme(theme);
		let listRef = void 0;
		let lastFocusedElementRef = null;
		let isFocusWithin = false;
		let lastMousePosition = null;
		const hotkeyLabel = $.derived(() => hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, ''));

		// Check for dismissed toasts and remove them. We need to do this to have dismiss animation.
		onMount(() => {
			const handleKeydown = (event) => {
				const isHotkeyPressed = hotkey.every((key

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				) => event[key] || event.code === key);

				if (isHotkeyPressed) {
					expanded = true;
					listRef?.focus();
				}

				if (event.code === 'Escape' && (document.activeElement === listRef || listRef?.contains(document.activeElement))) {
					expanded = false;
				}
			};

			return on(document, 'keydown', handleKeydown);
		});

		// @ts-expect-error deprecated API
		const handleBlur = (event) => {
			onblur?.(event);

			if (isFocusWithin && !event.currentTarget.contains(event.relatedTarget)) {
				isFocusWithin = false;

				if (lastFocusedElementRef) {
					lastFocusedElementRef.focus({ preventScroll: true });
					lastFocusedElementRef = null;
				}
			}
		};

		const handleFocus = (event) => {
			onfocus?.(event);

			const isNotDismissable = event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

			if (isNotDismissable) return;

			if (!isFocusWithin) {
				isFocusWithin = true;
				lastFocusedElementRef = event.relatedTarget;
			}
		};

		const handlePointerDown = (event) => {
			onpointerdown?.(event);

			const isNotDismissable = event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

			if (isNotDismissable) return;

			interacting = true;
		};

		const handleMouseEnter = (event) => {
			onmouseenter?.(event);
			lastMousePosition = { x: event.clientX, y: event.clientY };
			expanded = true;
		};

		const handleMouseLeave = (event) => {
			onmouseleave?.(event);

			// fix firefox firing mouseleave when the toast is closed by clicking
			// the close button and the toast leaves the mouse position. This doesn't
			// happen on other browsers, since the mouse wasn't moved by the user.
			// so we only collapse if mouse actually moved from last known position
			const currentPosition = { x: event.clientX, y: event.clientY };

			const mouseActuallyMoved = !lastMousePosition || Math.abs(currentPosition.x - lastMousePosition.x) > 1 || Math.abs(currentPosition.y - lastMousePosition.y) > 1;

			if (!interacting && mouseActuallyMoved) {
				expanded = false;
			}
		};

		const handleMouseMove = (event) => {
			onmousemove?.(event);
			lastMousePosition = { x: event.clientX, y: event.clientY };
			expanded = true;
		};

		const handleDragEnd = (event) => {
			ondragend?.(event);
			expanded = false;
		};

		const handlePointerUp = (event) => {
			onpointerup?.(event);
			interacting = false;
		};

		sonnerContext.set(new SonnerState());
		$$renderer.push(`<section${$.attr('aria-label', `${$.stringify(containerAriaLabel)} ${$.stringify(hotkeyLabel())}`)}${$.attr('tabindex', -1)} aria-live="polite" aria-relevant="additions text" aria-atomic="false">`);

		if (filteredToasts().length > 0) {
			$$renderer.push(`<!--[0--><!--[-->`);

			const each_array = $.ensure_array_like(possiblePositions());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let position = each_array[index];
				const [y, x] = position.split('-');
				const offsetObject = getOffsetObject(offset, mobileOffset);
				const frontHeight = toastState.heights.find((height) => height.toasterId === id && height.position === position)?.height ?? 0;

				$$renderer.push(`<ol${$.attributes(
					{
						tabindex: -1,
						dir: getDocumentDirection(),
						class: $.clsx(className),
						'data-sonner-toaster': true,
						'data-sonner-theme': actualTheme,
						'data-y-position': y,
						'data-x-position': x,
						style: restProps.style,
						...restProps
					},
					void 0,
					void 0,
					{
						'--front-toast-height': `${frontHeight}px`,
						'--width': `${TOAST_WIDTH}px`,
						'--gap': `${gap}px`,
						'--offset-top': offsetObject['--offset-top'],
						'--offset-right': offsetObject['--offset-right'],
						'--offset-bottom': offsetObject['--offset-bottom'],
						'--offset-left': offsetObject['--offset-left'],
						'--mobile-offset-top': offsetObject['--mobile-offset-top'],
						'--mobile-offset-right': offsetObject['--mobile-offset-right'],
						'--mobile-offset-bottom': offsetObject['--mobile-offset-bottom'],
						'--mobile-offset-left': offsetObject['--mobile-offset-left']
					}
				)}><!--[-->`);

				const each_array_1 = $.ensure_array_like(filteredToasts().filter((toast) => !toast.position && index === 0 || toast.position === position));

				for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
					let toast = each_array_1[index];

					{
						function successIcon($$renderer) {
							if (successIconProp) {
								$$renderer.push('<!--[0-->');
								successIconProp?.($$renderer);
								$$renderer.push(`<!---->`);
							} else if (successIconProp !== null) {
								$$renderer.push('<!--[1-->');
								SuccessIcon($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						function errorIcon($$renderer) {
							if (errorIconProp) {
								$$renderer.push('<!--[0-->');
								errorIconProp?.($$renderer);
								$$renderer.push(`<!---->`);
							} else if (errorIconProp !== null) {
								$$renderer.push('<!--[1-->');
								ErrorIcon($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						function warningIcon($$renderer) {
							if (warningIconProp) {
								$$renderer.push('<!--[0-->');
								warningIconProp?.($$renderer);
								$$renderer.push(`<!---->`);
							} else if (warningIconProp !== null) {
								$$renderer.push('<!--[1-->');
								WarningIcon($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						function infoIcon($$renderer) {
							if (infoIconProp) {
								$$renderer.push('<!--[0-->');
								infoIconProp?.($$renderer);
								$$renderer.push(`<!---->`);
							} else if (infoIconProp !== null) {
								$$renderer.push('<!--[1-->');
								InfoIcon($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						function closeIcon($$renderer) {
							if (closeIconProp) {
								$$renderer.push('<!--[0-->');
								closeIconProp?.($$renderer);
								$$renderer.push(`<!---->`);
							} else if (closeIconProp !== null) {
								$$renderer.push('<!--[1-->');
								CloseIcon($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]-->`);
						}

						Toast($$renderer, {
							index,
							toast,
							defaultRichColors: richColors,
							duration: toastOptions?.duration ?? duration,
							class: toastOptions?.class ?? '',
							descriptionClass: toastOptions?.descriptionClass || '',
							invert,
							visibleToasts,
							closeButton: toastOptions?.closeButton ?? closeButton,
							interacting,
							position,
							gap,
							style: toastOptions?.style ?? '',
							classes: toastOptions.classes || {},
							unstyled: toastOptions.unstyled ?? false,
							cancelButtonStyle: toastOptions?.cancelButtonStyle ?? '',
							actionButtonStyle: toastOptions?.actionButtonStyle ?? '',
							closeButtonAriaLabel: toastOptions?.closeButtonAriaLabel ?? closeButtonAriaLabel,
							expandByDefault: expand,
							expanded,
							swipeDirections,
							pauseWhenPageIsHidden,
							loadingIcon: loadingIconProp,
							successIcon,
							errorIcon,
							warningIcon,
							infoIcon,
							closeIcon,
							$$slots: {
								successIcon: true,
								errorIcon: true,
								warningIcon: true,
								infoIcon: true,
								closeIcon: true
							}
						});
					}
				}

				$$renderer.push(`<!--]--></ol>`);
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></section>`);
	});
}