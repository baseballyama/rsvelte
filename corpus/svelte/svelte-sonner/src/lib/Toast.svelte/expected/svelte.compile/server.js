import * as $ from 'svelte/internal/server';
import { onMount, untrack } from 'svelte';
import { isAction } from './types.js';
import { toastState } from './toast-state.svelte.js';
import { cn } from './internal/helpers.js';
import { useDocumentHidden } from './internal/use-document-hidden.svelte.js';
import Loader from './Loader.svelte';

const TOAST_LIFETIME = 4000;
const GAP = 14;
const SWIPE_THRESHOLD = 45;
const TIME_BEFORE_UNMOUNT = 200;
const SCALE_MULTIPLIER = 0.05;

const DEFAULT_TOAST_CLASSES = {
	toast: '',
	title: '',
	description: '',
	loader: '',
	closeButton: '',
	cancelButton: '',
	actionButton: '',
	action: '',
	warning: '',
	error: '',
	success: '',
	default: '',
	info: '',
	loading: ''
};

function getDefaultSwipeDirections(position) {
	const [y, x] = position.split('-');
	const directions = [];

	if (y) {
		directions.push(y);
	}

	if (x) {
		directions.push(x);
	}

	return directions;
}

function getDampening(delta) {
	const factor = Math.abs(delta) / 20;

	return 1 / (1.5 + factor);
}

export default function Toast($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			toast,
			index,
			expanded,
			invert: invertFromToaster,
			position,
			visibleToasts,
			expandByDefault,
			closeButton: closeButtonFromToaster,
			interacting,
			cancelButtonStyle = '',
			actionButtonStyle = '',
			duration: durationFromToaster,
			descriptionClass = '',
			classes: classesProp,
			unstyled = false,
			loadingIcon,
			successIcon,
			errorIcon,
			warningIcon,
			closeIcon,
			infoIcon,
			defaultRichColors = false,
			gap = GAP,
			swipeDirections: swipeDirectionsProp,
			closeButtonAriaLabel,
			pauseWhenPageIsHidden,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const defaultClasses = { ...DEFAULT_TOAST_CLASSES };
		let mounted = false;
		let removed = false;
		let swiping = false;
		let swipeOut = false;
		let isSwiped = false;
		let offsetBeforeRemove = 0;
		let initialHeight = 0;
		let remainingTime = toast.duration || durationFromToaster || TOAST_LIFETIME;
		let dragStartTime = null;
		let toastRef = void 0;
		let swipeDirection = null;
		let swipeOutDirection = null;
		const isFront = $.derived(() => index === 0);
		const isVisible = $.derived(() => index + 1 <= visibleToasts);
		const toastType = $.derived(() => toast.type);

		const dismissible = $.derived(() => toast.dismissible !== undefined
			? toast.dismissible !== false
			: toast.dismissable !== false);

		const toastClass = $.derived(() => toast.class || '');
		const toastDescriptionClass = $.derived(() => toast.descriptionClass || '');

		// height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
		// Only the heights of this toaster + position matter for the offset math,
		// otherwise toasts of another toaster (or another corner) push these around.
		const relevantHeights = $.derived(() => toastState.heights.filter((height) => height.toasterId === toast.toasterId && height.position === position));

		// findIndex returns -1 when not yet measured; -1 is truthy, so `|| 0` left a negative index in the offset math.
		const heightIndex = $.derived(() => {
			const idx = relevantHeights().findIndex((height) => height.toastId === toast.id);

			return idx === -1 ? 0 : idx;
		});

		const closeButton = $.derived(() => toast.closeButton ?? closeButtonFromToaster);
		const duration = $.derived(() => toast.duration ?? durationFromToaster ?? TOAST_LIFETIME);
		let pointerStart = null;
		const coords = $.derived(() => position.split('-'));
		const swipeDirections = $.derived(() => swipeDirectionsProp ?? getDefaultSwipeDirections(position));

		const toastsHeightBefore = $.derived(() => relevantHeights().reduce(
			(prev, curr, reducerIndex) => {
				if (reducerIndex >= heightIndex()) return prev;

				return prev + curr.height;
			},
			0
		));

		const isDocumentHidden = useDocumentHidden();
		const invert = $.derived(() => toast.invert || invertFromToaster);
		const disabled = $.derived(() => toastType() === 'loading');
		const classes = $.derived(() => ({ ...defaultClasses, ...classesProp }));
		const toastTitle = $.derived(() => toast.title);
		const toastDescription = $.derived(() => toast.description);
		let closeTimerStartTime = 0;
		let lastCloseTimerStartTime = 0;
		const offset = $.derived(() => Math.round(heightIndex() * gap + toastsHeightBefore()));

		// use scaledRectHeight as it's more precise
		// toast was transitioning its scale, so scaledRectHeight isn't accurate
		function deleteToast() {
			removed = true;

			// save the offset for the exit swipe animation
			offsetBeforeRemove = offset();

			toastState.removeHeight(toast.id);
			toastState.markDismissed(toast.id);
			toastState.scheduleRemoval(toast.id, TIME_BEFORE_UNMOUNT);
		}

		let timeoutId;
		const isPromiseLoadingOrInfiniteDuration = $.derived(() => toast.promise && toastType() === 'loading' || toast.duration === Number.POSITIVE_INFINITY);

		function startTimer() {
			// Both the timer effect and the `updated` effect can start a timer in the
			// same flush (a recreated toast mounts with `updated` already set); clear
			// first so only one runs.
			clearTimeout(timeoutId);

			closeTimerStartTime = new Date().getTime();

			// let the toast know it has started
			timeoutId = setTimeout(
				() => {
					toast.onAutoClose?.(toast);
					deleteToast();
				},
				remainingTime
			);
		}

		function pauseTimer() {
			if (lastCloseTimerStartTime < closeTimerStartTime) {
				// get the elapsed time since the timer started
				const elapsedTime = new Date().getTime() - closeTimerStartTime;

				remainingTime = remainingTime - elapsedTime;
			}

			lastCloseTimerStartTime = new Date().getTime();
		}

		// if the toast has been updated after the initial render,
		// we want to reset the timer and set the remaining time to the
		// new duration
		onMount(() => {
			mounted = true;

			const height = toastRef?.getBoundingClientRect().height;

			initialHeight = height;

			toastState.setHeight({
				toastId: toast.id,
				height,
				toasterId: toast.toasterId,
				position
			});

			return () => {
				toastState.removeHeight(toast.id);
			};
		});

		// `markDismissed` flips `delete` for dismissals that already ran
		// `deleteToast` themselves (close button, swipe, auto-close), so
		// don't re-enter and double-fire `onDismiss`.
		// The toast was recreated with the same id while this instance's exit animation
		// was running (`create` cancelled the pending removal). The keyed each reuses
		// this component instance, so revive its local exit state.
		const handlePointerDown = (event) => {
			if (disabled()) return;

			dragStartTime = new Date();
			offsetBeforeRemove = offset();

			const target = event.target;

			// ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
			target.setPointerCapture(event.pointerId);

			if (target.tagName === 'BUTTON') return;

			swiping = true;
			pointerStart = { x: event.clientX, y: event.clientY };
		};

		const handlePointerUp = () => {
			if (swipeOut || !dismissible()) return;

			pointerStart = null;

			const swipeAmountX = Number(toastRef?.style.getPropertyValue('--swipe-amount-x').replace('px', '') || 0);
			const swipeAmountY = Number(toastRef?.style.getPropertyValue('--swipe-amount-y').replace('px', '') || 0);
			const timeTaken = new Date().getTime() - (dragStartTime?.getTime() ?? 0);
			const swipeAmount = swipeDirection === 'x' ? swipeAmountX : swipeAmountY;
			const velocity = Math.abs(swipeAmount) / timeTaken;

			// Movement towards a direction that isn't allowed is dampened, not blocked,
			// so a fast flick can still pass the velocity check. Only dismiss if the
			// direction is allowed.
			const isAllowedDirection = swipeDirection === 'x'
				? swipeDirections().includes(swipeAmountX > 0 ? 'right' : 'left')
				: swipeDirections().includes(swipeAmountY > 0 ? 'bottom' : 'top');

			// remove only if threshold is met
			if (isAllowedDirection && (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11)) {
				offsetBeforeRemove = offset();
				toast.onDismiss?.(toast);

				if (swipeDirection === 'x') {
					swipeOutDirection = swipeAmountX > 0 ? 'right' : 'left';
				} else {
					swipeOutDirection = swipeAmountY > 0 ? 'down' : 'up';
				}

				deleteToast();
				swipeOut = true;

				return;
			} else {
				toastRef?.style.setProperty('--swipe-amount-x', '0px');
				toastRef?.style.setProperty('--swipe-amount-y', '0px');
			}

			isSwiped = false;
			swiping = false;
			swipeDirection = null;
		};

		const handlePointerMove = (event) => {
			if (!pointerStart || !dismissible()) return;

			const isHighlighted = (window.getSelection()?.toString().length ?? -1) > 0;

			if (isHighlighted) return;

			const yDelta = event.clientY - pointerStart.y;
			const xDelta = event.clientX - pointerStart.x;

			// Determine swipe direction if not already locked
			if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
				swipeDirection = Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y';
			}

			let swipeAmount = { x: 0, y: 0 };

			if (swipeDirection === 'y') {
				// handle vertical swipes
				if (swipeDirections().includes('top') || swipeDirections().includes('bottom')) {
					if (swipeDirections().includes('top') && yDelta < 0 || swipeDirections().includes('bottom') && yDelta > 0) {
						swipeAmount.y = yDelta;
					} else {
						// smoothly transition to dampened movement
						const dampenedDelta = yDelta * getDampening(yDelta);

						// ensure we don't jump when transition to dampened movement
						swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
					}
				}
			} else if (swipeDirection === 'x') {
				// handle horizontal swipes
				if (swipeDirections().includes('left') || swipeDirections().includes('right')) {
					if (swipeDirections().includes('left') && xDelta < 0 || swipeDirections().includes('right') && xDelta > 0) {
						swipeAmount.x = xDelta;
					} else {
						// Smoothly transition to dampened movement
						const dampenedDelta = xDelta * getDampening(xDelta);

						// Ensure we don't jump when transitioning to dampened movement
						swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
					}
				}
			}

			if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
				isSwiped = true;
			}

			toastRef?.style.setProperty('--swipe-amount-x', `${swipeAmount.x}px`);
			toastRef?.style.setProperty('--swipe-amount-y', `${swipeAmount.y}px`);
		};

		const handleDragEnd = () => {
			swiping = false;
			swipeDirection = null;
			pointerStart = null;
		};

		const icon = $.derived(() => {
			if (toast.icon) return toast.icon;
			if (toastType() === 'success') return successIcon;
			if (toastType() === 'error') return errorIcon;
			if (toastType() === 'warning') return warningIcon;
			if (toastType() === 'info') return infoIcon;
			if (toastType() === 'loading') return loadingIcon;

			return null;
		});

		function LoadingIcon($$renderer) {
			if (loadingIcon) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(cn(classes()?.loader, toast?.classes?.loader, 'sonner-loader')))}${$.attr('data-visible', toastType() === 'loading')}>`);
				loadingIcon($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');

				Loader($$renderer, {
					class: cn(classes()?.loader, toast.classes?.loader),
					visible: toastType() === 'loading'
				});
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<li${$.attr('tabindex', 0)}${$.attr_class($.clsx(cn(restProps.class, toastClass(), classes()?.toast, toast?.classes?.toast, classes()?.[toastType()], toast?.classes?.[toastType()])))}${$.attr('aria-live', toast.important ? 'assertive' : 'polite')} aria-atomic="true" data-sonner-toast=""${$.attr('data-rich-colors', toast.richColors ?? defaultRichColors)}${$.attr('data-styled', !(toast.component || toast.unstyled || unstyled))}${$.attr('data-mounted', mounted)}${$.attr('data-promise', Boolean(toast.promise))}${$.attr('data-swiped', isSwiped)}${$.attr('data-removed', removed)}${$.attr('data-visible', isVisible())}${$.attr('data-y-position', coords()[0])}${$.attr('data-x-position', coords()[1])}${$.attr('data-index', index)}${$.attr('data-front', isFront())}${$.attr('data-swiping', swiping)}${$.attr('data-dismissible', dismissible())}${$.attr('data-type', toastType())}${$.attr('data-invert', invert())}${$.attr('data-swipe-out', swipeOut)}${$.attr('data-swipe-direction', swipeOutDirection)}${$.attr('data-expanded', Boolean(expanded || expandByDefault && mounted))}${$.attr_style(`${restProps.style} ${toast.style}`, {
			'--index': index,
			'--toasts-before': index,
			'--z-index': toastState.toasts.length - index,
			'--offset': `${removed ? offsetBeforeRemove : offset()}px`,
			'--initial-height': expandByDefault ? 'auto' : `${initialHeight}px`
		})}>`);

		if (closeButton() && !toast.component && toastType() !== 'loading' && closeIcon !== null) {
			$$renderer.push(`<!--[0--><button${$.attr('aria-label', closeButtonAriaLabel)}${$.attr('data-disabled', disabled())} data-close-button=""${$.attr_class($.clsx(cn(classes()?.closeButton, toast?.classes?.closeButton)))}>`);
			closeIcon?.($$renderer);
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (toast.component) {
			$$renderer.push('<!--[0-->');

			const Component = toast.component;

			if (Component) {
				$$renderer.push('<!--[-->');
				Component($$renderer, $.spread_props([toast.componentProps, { closeToast: deleteToast }]));
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');

			if ((toastType() || toast.icon || toast.promise) && toast.icon !== null && (icon() !== null || toast.icon)) {
				$$renderer.push(`<!--[0--><div data-icon=""${$.attr_class($.clsx(cn(classes()?.icon, toast?.classes?.icon)))}>`);

				if (toastType() === 'loading') {
					$$renderer.push('<!--[0-->');

					if (toast.icon) {
						$$renderer.push('<!--[0-->');

						if (toast.icon) {
							$$renderer.push('<!--[-->');
							toast.icon($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push('<!--[-1-->');
						LoadingIcon($$renderer);
					}

					$$renderer.push(`<!--]-->`);
				} else if (toast.promise) {
					$$renderer.push('<!--[1-->');
					LoadingIcon($$renderer);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (toastType() !== 'loading') {
					$$renderer.push('<!--[0-->');

					if (toast.icon) {
						$$renderer.push('<!--[0-->');

						if (toast.icon) {
							$$renderer.push('<!--[-->');
							toast.icon($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else if (toastType() === 'success') {
						$$renderer.push('<!--[1-->');
						successIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					} else if (toastType() === 'error') {
						$$renderer.push('<!--[2-->');
						errorIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					} else if (toastType() === 'warning') {
						$$renderer.push('<!--[3-->');
						warningIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					} else if (toastType() === 'info') {
						$$renderer.push('<!--[4-->');
						infoIcon?.($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div data-content=""${$.attr_class($.clsx(cn(classes()?.content, toast?.classes?.content)))}><div data-title=""${$.attr_class($.clsx(cn(classes()?.title, toast?.classes?.title)))}>`);

			if (toast.title) {
				$$renderer.push('<!--[0-->');

				if (typeof toast.title !== 'string') {
					$$renderer.push('<!--[0-->');

					const Title = toast.title;

					if (Title) {
						$$renderer.push('<!--[-->');
						Title($$renderer, $.spread_props([toast.componentProps]));
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(toast.title)}`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (toast.description) {
				$$renderer.push(`<!--[0--><div data-description=""${$.attr_class($.clsx(cn(descriptionClass, toastDescriptionClass(), classes()?.description, toast.classes?.description)))}>`);

				if (typeof toast.description !== 'string') {
					$$renderer.push('<!--[0-->');

					const Description = toast.description;

					if (Description) {
						$$renderer.push('<!--[-->');
						Description($$renderer, $.spread_props([toast.componentProps]));
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else {
					$$renderer.push(`<!--[-1-->${$.escape(toast.description)}`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (toast.cancel) {
				$$renderer.push('<!--[0-->');

				if (typeof toast.cancel === 'function') {
					$$renderer.push('<!--[0-->');

					if (toast.cancel) {
						$$renderer.push('<!--[-->');
						toast.cancel($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else if (isAction(toast.cancel)) {
					$$renderer.push(`<!--[1--><button data-button="" data-cancel=""${$.attr_style(toast.cancelButtonStyle ?? cancelButtonStyle)}${$.attr_class($.clsx(cn(classes()?.cancelButton, toast?.classes?.cancelButton)))}>${$.escape(toast.cancel.label)}</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (toast.action) {
				$$renderer.push('<!--[0-->');

				if (typeof toast.action === 'function') {
					$$renderer.push('<!--[0-->');

					if (toast.action) {
						$$renderer.push('<!--[-->');
						toast.action($$renderer, {});
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				} else if (isAction(toast.action)) {
					$$renderer.push(`<!--[1--><button data-button=""${$.attr_style(toast.actionButtonStyle ?? actionButtonStyle)}${$.attr_class($.clsx(cn(classes()?.actionButton, toast?.classes?.actionButton)))}>${$.escape(toast.action.label)}</button>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></li>`);
	});
}