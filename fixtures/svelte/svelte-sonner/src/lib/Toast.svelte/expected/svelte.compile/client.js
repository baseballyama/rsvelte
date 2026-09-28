import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'toast',
	'index',
	'expanded',
	'invert',
	'position',
	'visibleToasts',
	'expandByDefault',
	'closeButton',
	'interacting',
	'cancelButtonStyle',
	'actionButtonStyle',
	'duration',
	'descriptionClass',
	'classes',
	'unstyled',
	'loadingIcon',
	'successIcon',
	'errorIcon',
	'warningIcon',
	'closeIcon',
	'infoIcon',
	'defaultRichColors',
	'gap',
	'swipeDirections',
	'closeButtonAriaLabel',
	'pauseWhenPageIsHidden'
]);

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<button data-close-button=""><!></button>`);
var root_2 = $.from_html(`<div data-icon=""><!> <!></div>`);
var root_3 = $.from_html(`<div data-description=""><!></div>`);
var root_4 = $.from_html(`<button data-button="" data-cancel=""> </button>`);
var root_5 = $.from_html(`<button data-button=""> </button>`);
var root_6 = $.from_html(`<!> <div data-content=""><div data-title=""><!></div> <!></div> <!> <!>`, 1);
var root_7 = $.from_html(`<li aria-atomic="true" data-sonner-toast=""><!> <!></li>`);

export default function Toast($$anchor, $$props) {
	$.push($$props, true);

	const // height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
	// Only the heights of this toaster + position matter for the offset math,
	// otherwise toasts of another toaster (or another corner) push these around.
	// findIndex returns -1 when not yet measured; -1 is truthy, so `|| 0` left a negative index in the offset math.
	// use scaledRectHeight as it's more precise
	// toast was transitioning its scale, so scaledRectHeight isn't accurate
	// save the offset for the exit swipe animation
	// Both the timer effect and the `updated` effect can start a timer in the
	// same flush (a recreated toast mounts with `updated` already set); clear
	// first so only one runs.
	// let the toast know it has started
	// get the elapsed time since the timer started
	// if the toast has been updated after the initial render,
	// we want to reset the timer and set the remaining time to the
	// new duration
	// `markDismissed` flips `delete` for dismissals that already ran
	// `deleteToast` themselves (close button, swipe, auto-close), so
	// don't re-enter and double-fire `onDismiss`.
	// The toast was recreated with the same id while this instance's exit animation
	// was running (`create` cancelled the pending removal). The keyed each reuses
	// this component instance, so revive its local exit state.
	// ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
	// Movement towards a direction that isn't allowed is dampened, not blocked,
	// so a fast flick can still pass the velocity check. Only dismiss if the
	// direction is allowed.
	// remove only if threshold is met
	// Determine swipe direction if not already locked
	// handle vertical swipes
	// smoothly transition to dampened movement
	// ensure we don't jump when transition to dampened movement
	// handle horizontal swipes
	// Smoothly transition to dampened movement
	// Ensure we don't jump when transitioning to dampened movement
	LoadingIcon = ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var div = root();
				var node_1 = $.child(div);

				$.snippet(node_1, () => $$props.loadingIcon);
				$.reset(div);

				$.template_effect(
					($0) => {
						$.set_class(div, 1, $0);
						$.set_attribute(div, 'data-visible', $.get(toastType) === 'loading');
					},
					[
						() => $.clsx(cn($.get(classes)?.loader, $$props.toast?.classes?.loader, 'sonner-loader'))
					]
				);

				$.append($$anchor, div);
			};

			var alternate = ($$anchor) => {
				{
					let $0 = $.derived(() => cn($.get(classes)?.loader, $$props.toast.classes?.loader));
					let $1 = $.derived(() => $.get(toastType) === 'loading');

					Loader($$anchor, {
						get class() {
							return $.get($0);
						},

						get visible() {
							return $.get($1);
						}
					});
				}
			};

			$.if(node, ($$render) => {
				if ($$props.loadingIcon) $$render(consequent); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment);
	};

	let cancelButtonStyle = $.prop($$props, 'cancelButtonStyle', 3, ''),
		actionButtonStyle = $.prop($$props, 'actionButtonStyle', 3, ''),
		descriptionClass = $.prop($$props, 'descriptionClass', 3, ''),
		unstyled = $.prop($$props, 'unstyled', 3, false),
		defaultRichColors = $.prop($$props, 'defaultRichColors', 3, false),
		gap = $.prop($$props, 'gap', 3, GAP),
		restProps = $.rest_props($$props, rest_excludes);

	const defaultClasses = { ...DEFAULT_TOAST_CLASSES };
	let mounted = $.state(false);
	let removed = $.state(false);
	let swiping = $.state(false);
	let swipeOut = $.state(false);
	let isSwiped = $.state(false);
	let offsetBeforeRemove = $.state(0);
	let initialHeight = $.state(0);
	let remainingTime = $$props.toast.duration || $$props.duration || TOAST_LIFETIME;
	let dragStartTime = $.state(null);
	let toastRef = $.state(void 0);
	let swipeDirection = $.state(null);
	let swipeOutDirection = $.state(null);
	const isFront = $.derived(() => $$props.index === 0);
	const isVisible = $.derived(() => $$props.index + 1 <= $$props.visibleToasts);
	const toastType = $.derived(() => $$props.toast.type);

	const dismissible = $.derived(() => $$props.toast.dismissible !== undefined
		? $$props.toast.dismissible !== false
		: $$props.toast.dismissable !== false);

	const toastClass = $.derived(() => $$props.toast.class || '');
	const toastDescriptionClass = $.derived(() => $$props.toast.descriptionClass || '');
	const relevantHeights = $.derived(() => toastState.heights.filter((height) => height.toasterId === $$props.toast.toasterId && height.position === $$props.position));

	const heightIndex = $.derived(() => {
		const idx = $.get(relevantHeights).findIndex((height) => height.toastId === $$props.toast.id);

		return idx === -1 ? 0 : idx;
	});

	const closeButton = $.derived(() => $$props.toast.closeButton ?? $$props.closeButton);
	const duration = $.derived(() => $$props.toast.duration ?? $$props.duration ?? TOAST_LIFETIME);
	let pointerStart = null;
	const coords = $.derived(() => $$props.position.split('-'));
	const swipeDirections = $.derived(() => $$props.swipeDirections ?? getDefaultSwipeDirections($$props.position));

	const toastsHeightBefore = $.derived(() => $.get(relevantHeights).reduce(
		(prev, curr, reducerIndex) => {
			if (reducerIndex >= $.get(heightIndex)) return prev;

			return prev + curr.height;
		},
		0
	));

	const isDocumentHidden = useDocumentHidden();
	const invert = $.derived(() => $$props.toast.invert || $$props.invert);
	const disabled = $.derived(() => $.get(toastType) === 'loading');
	const classes = $.derived(() => ({ ...defaultClasses, ...$$props.classes }));
	const toastTitle = $.derived(() => $$props.toast.title);
	const toastDescription = $.derived(() => $$props.toast.description);
	let closeTimerStartTime = $.state(0);
	let lastCloseTimerStartTime = $.state(0);
	const offset = $.derived(() => Math.round($.get(heightIndex) * gap() + $.get(toastsHeightBefore)));

	$.user_effect(() => {
		$.get(toastTitle);
		$.get(toastDescription);

		let scale;

		if ($$props.expanded || $$props.expandByDefault) {
			scale = 1;
		} else {
			scale = 1 - $$props.index * SCALE_MULTIPLIER;
		}

		const toastEl = untrack(() => $.get(toastRef));

		if (toastEl === undefined) return;

		toastEl.style.setProperty('height', 'auto');

		const offsetHeight = toastEl.offsetHeight;
		const rectHeight = toastEl.getBoundingClientRect().height;
		const scaledRectHeight = Math.round((rectHeight / scale + Number.EPSILON) * 100) / 100;

		toastEl.style.removeProperty('height');

		let finalHeight;

		if (Math.abs(scaledRectHeight - offsetHeight) < 1) {
			// use scaledRectHeight as it's more precise
			finalHeight = scaledRectHeight;
		} else {
			// toast was transitioning its scale, so scaledRectHeight isn't accurate
			finalHeight = offsetHeight;
		}

		$.set(initialHeight, finalHeight, true);

		toastState.setHeight({
			toastId: $$props.toast.id,
			height: finalHeight,
			toasterId: $$props.toast.toasterId,
			position: $$props.position
		});
	});

	function deleteToast() {
		$.set(removed, true);

		// save the offset for the exit swipe animation
		$.set(offsetBeforeRemove, $.get(offset), true);

		toastState.removeHeight($$props.toast.id);
		toastState.markDismissed($$props.toast.id);
		toastState.scheduleRemoval($$props.toast.id, TIME_BEFORE_UNMOUNT);
	}

	let timeoutId;
	const isPromiseLoadingOrInfiniteDuration = $.derived(() => $$props.toast.promise && $.get(toastType) === 'loading' || $$props.toast.duration === Number.POSITIVE_INFINITY);

	function startTimer() {
		// Both the timer effect and the `updated` effect can start a timer in the
		// same flush (a recreated toast mounts with `updated` already set); clear
		// first so only one runs.
		clearTimeout(timeoutId);

		$.set(closeTimerStartTime, new Date().getTime(), true);

		// let the toast know it has started
		timeoutId = setTimeout(
			() => {
				$$props.toast.onAutoClose?.($$props.toast);
				deleteToast();
			},
			remainingTime
		);
	}

	function pauseTimer() {
		if ($.get(lastCloseTimerStartTime) < $.get(closeTimerStartTime)) {
			// get the elapsed time since the timer started
			const elapsedTime = new Date().getTime() - $.get(closeTimerStartTime);

			remainingTime = remainingTime - elapsedTime;
		}

		$.set(lastCloseTimerStartTime, new Date().getTime(), true);
	}

	$.user_effect(() => {
		if ($$props.toast.updated) {
			// if the toast has been updated after the initial render,
			// we want to reset the timer and set the remaining time to the
			// new duration
			clearTimeout(timeoutId);

			remainingTime = $.get(duration);

			if (!$.get(isPromiseLoadingOrInfiniteDuration)) {
				startTimer();
			}
		}
	});

	$.user_effect(() => {
		if (!$.get(isPromiseLoadingOrInfiniteDuration)) {
			if ($$props.expanded || $$props.interacting || $$props.pauseWhenPageIsHidden && isDocumentHidden.current) {
				pauseTimer();
			} else {
				startTimer();
			}
		}

		return () => clearTimeout(timeoutId);
	});

	onMount(() => {
		$.set(mounted, true);

		const height = $.get(toastRef)?.getBoundingClientRect().height;

		$.set(initialHeight, height, true);

		toastState.setHeight({
			toastId: $$props.toast.id,
			height,
			toasterId: $$props.toast.toasterId,
			position: $$props.position
		});

		return () => {
			toastState.removeHeight($$props.toast.id);
		};
	});

	$.user_effect(() => {
		if ($$props.toast.delete) {
			untrack(() => {
				// `markDismissed` flips `delete` for dismissals that already ran
				// `deleteToast` themselves (close button, swipe, auto-close), so
				// don't re-enter and double-fire `onDismiss`.
				if ($.get(removed)) return;

				deleteToast();
				$$props.toast.onDismiss?.($$props.toast);
			});
		}
	});

	// The toast was recreated with the same id while this instance's exit animation
	// was running (`create` cancelled the pending removal). The keyed each reuses
	// this component instance, so revive its local exit state.
	$.user_effect(() => {
		if (!$$props.toast.delete && !$$props.toast.dismiss && $.get(removed)) {
			untrack(() => {
				$.set(removed, false);
				$.set(swipeOut, false);
				$.set(isSwiped, false);
				$.set(swiping, false);
				$.set(swipeDirection, null);
				$.set(swipeOutDirection, null);
				pointerStart = null;
				$.set(dragStartTime, null);
				$.get(toastRef)?.style.removeProperty('--swipe-amount-x');
				$.get(toastRef)?.style.removeProperty('--swipe-amount-y');
				clearTimeout(timeoutId);
				remainingTime = $.get(duration);

				if (!$.get(isPromiseLoadingOrInfiniteDuration)) {
					startTimer();
				}

				toastState.setHeight({
					toastId: $$props.toast.id,
					height: $.get(initialHeight),
					toasterId: $$props.toast.toasterId,
					position: $$props.position
				});
			});
		}
	});

	const handlePointerDown = (event) => {
		if ($.get(disabled)) return;

		$.set(dragStartTime, new Date(), true);
		$.set(offsetBeforeRemove, $.get(offset), true);

		const target = event.target;

		// ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
		target.setPointerCapture(event.pointerId);

		if (target.tagName === 'BUTTON') return;

		$.set(swiping, true);
		pointerStart = { x: event.clientX, y: event.clientY };
	};

	const handlePointerUp = () => {
		if ($.get(swipeOut) || !$.get(dismissible)) return;

		pointerStart = null;

		const swipeAmountX = Number($.get(toastRef)?.style.getPropertyValue('--swipe-amount-x').replace('px', '') || 0);
		const swipeAmountY = Number($.get(toastRef)?.style.getPropertyValue('--swipe-amount-y').replace('px', '') || 0);
		const timeTaken = new Date().getTime() - ($.get(dragStartTime)?.getTime() ?? 0);
		const swipeAmount = $.get(swipeDirection) === 'x' ? swipeAmountX : swipeAmountY;
		const velocity = Math.abs(swipeAmount) / timeTaken;

		// Movement towards a direction that isn't allowed is dampened, not blocked,
		// so a fast flick can still pass the velocity check. Only dismiss if the
		// direction is allowed.
		const isAllowedDirection = $.get(swipeDirection) === 'x'
			? $.get(swipeDirections).includes(swipeAmountX > 0 ? 'right' : 'left')
			: $.get(swipeDirections).includes(swipeAmountY > 0 ? 'bottom' : 'top');

		// remove only if threshold is met
		if (isAllowedDirection && (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11)) {
			$.set(offsetBeforeRemove, $.get(offset), true);
			$$props.toast.onDismiss?.($$props.toast);

			if ($.get(swipeDirection) === 'x') {
				$.set(swipeOutDirection, swipeAmountX > 0 ? 'right' : 'left', true);
			} else {
				$.set(swipeOutDirection, swipeAmountY > 0 ? 'down' : 'up', true);
			}

			deleteToast();
			$.set(swipeOut, true);

			return;
		} else {
			$.get(toastRef)?.style.setProperty('--swipe-amount-x', '0px');
			$.get(toastRef)?.style.setProperty('--swipe-amount-y', '0px');
		}

		$.set(isSwiped, false);
		$.set(swiping, false);
		$.set(swipeDirection, null);
	};

	const handlePointerMove = (event) => {
		if (!pointerStart || !$.get(dismissible)) return;

		const isHighlighted = (window.getSelection()?.toString().length ?? -1) > 0;

		if (isHighlighted) return;

		const yDelta = event.clientY - pointerStart.y;
		const xDelta = event.clientX - pointerStart.x;

		// Determine swipe direction if not already locked
		if (!$.get(swipeDirection) && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
			$.set(swipeDirection, Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y', true);
		}

		let swipeAmount = { x: 0, y: 0 };

		if ($.get(swipeDirection) === 'y') {
			// handle vertical swipes
			if ($.get(swipeDirections).includes('top') || $.get(swipeDirections).includes('bottom')) {
				if ($.get(swipeDirections).includes('top') && yDelta < 0 || $.get(swipeDirections).includes('bottom') && yDelta > 0) {
					swipeAmount.y = yDelta;
				} else {
					// smoothly transition to dampened movement
					const dampenedDelta = yDelta * getDampening(yDelta);

					// ensure we don't jump when transition to dampened movement
					swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
				}
			}
		} else if ($.get(swipeDirection) === 'x') {
			// handle horizontal swipes
			if ($.get(swipeDirections).includes('left') || $.get(swipeDirections).includes('right')) {
				if ($.get(swipeDirections).includes('left') && xDelta < 0 || $.get(swipeDirections).includes('right') && xDelta > 0) {
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
			$.set(isSwiped, true);
		}

		$.get(toastRef)?.style.setProperty('--swipe-amount-x', `${swipeAmount.x}px`);
		$.get(toastRef)?.style.setProperty('--swipe-amount-y', `${swipeAmount.y}px`);
	};

	const handleDragEnd = () => {
		$.set(swiping, false);
		$.set(swipeDirection, null);
		pointerStart = null;
	};

	const icon = $.derived(() => {
		if ($$props.toast.icon) return $$props.toast.icon;
		if ($.get(toastType) === 'success') return $$props.successIcon;
		if ($.get(toastType) === 'error') return $$props.errorIcon;
		if ($.get(toastType) === 'warning') return $$props.warningIcon;
		if ($.get(toastType) === 'info') return $$props.infoIcon;
		if ($.get(toastType) === 'loading') return $$props.loadingIcon;

		return null;
	});

	var li = root_7();

	$.set_attribute(li, 'tabindex', 0);

	let styles;
	var node_2 = $.child(li);

	{
		var consequent_1 = ($$anchor) => {
			var button = root_1();
			var node_3 = $.child(button);

			$.snippet(node_3, () => $$props.closeIcon ?? $.noop);
			$.reset(button);

			$.template_effect(
				($0) => {
					$.set_attribute(button, 'aria-label', $$props.closeButtonAriaLabel);
					$.set_attribute(button, 'data-disabled', $.get(disabled));
					$.set_class(button, 1, $0);
				},
				[
					() => $.clsx(cn($.get(classes)?.closeButton, $$props.toast?.classes?.closeButton))
				]
			);

			$.delegated('click', button, () => {
				if ($.get(disabled) || !$.get(dismissible)) return;

				deleteToast();
				$$props.toast.onDismiss?.($$props.toast);
			});

			$.append($$anchor, button);
		};

		$.if(node_2, ($$render) => {
			if ($.get(closeButton) && !$$props.toast.component && $.get(toastType) !== 'loading' && $$props.closeIcon !== null) $$render(consequent_1);
		});
	}

	var node_4 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			const Component = $.derived(() => $$props.toast.component);
			var fragment_2 = $.comment();
			var node_5 = $.first_child(fragment_2);

			$.component(node_5, () => $.get(Component), ($$anchor, Component_1) => {
				Component_1($$anchor, $.spread_props(() => $$props.toast.componentProps, { closeToast: deleteToast }));
			});

			$.append($$anchor, fragment_2);
		};

		var alternate_4 = ($$anchor) => {
			var fragment_3 = root_6();
			var node_6 = $.first_child(fragment_3);

			{
				var consequent_12 = ($$anchor) => {
					var div_1 = root_2();
					var node_7 = $.child(div_1);

					{
						var consequent_4 = ($$anchor) => {
							var fragment_4 = $.comment();
							var node_8 = $.first_child(fragment_4);

							{
								var consequent_3 = ($$anchor) => {
									var fragment_5 = $.comment();
									var node_9 = $.first_child(fragment_5);

									$.component(node_9, () => $$props.toast.icon, ($$anchor, toast_icon) => {
										toast_icon($$anchor, {});
									});

									$.append($$anchor, fragment_5);
								};

								var alternate_1 = ($$anchor) => {
									LoadingIcon($$anchor);
								};

								$.if(node_8, ($$render) => {
									if ($$props.toast.icon) $$render(consequent_3); else $$render(alternate_1, -1);
								});
							}

							$.append($$anchor, fragment_4);
						};

						var consequent_5 = ($$anchor) => {
							LoadingIcon($$anchor);
						};

						$.if(node_7, ($$render) => {
							if ($.get(toastType) === 'loading') $$render(consequent_4); else if ($$props.toast.promise) $$render(consequent_5, 1);
						});
					}

					var node_10 = $.sibling(node_7, 2);

					{
						var consequent_11 = ($$anchor) => {
							var fragment_8 = $.comment();
							var node_11 = $.first_child(fragment_8);

							{
								var consequent_6 = ($$anchor) => {
									var fragment_9 = $.comment();
									var node_12 = $.first_child(fragment_9);

									$.component(node_12, () => $$props.toast.icon, ($$anchor, toast_icon_1) => {
										toast_icon_1($$anchor, {});
									});

									$.append($$anchor, fragment_9);
								};

								var consequent_7 = ($$anchor) => {
									var fragment_10 = $.comment();
									var node_13 = $.first_child(fragment_10);

									$.snippet(node_13, () => $$props.successIcon ?? $.noop);
									$.append($$anchor, fragment_10);
								};

								var consequent_8 = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_14 = $.first_child(fragment_11);

									$.snippet(node_14, () => $$props.errorIcon ?? $.noop);
									$.append($$anchor, fragment_11);
								};

								var consequent_9 = ($$anchor) => {
									var fragment_12 = $.comment();
									var node_15 = $.first_child(fragment_12);

									$.snippet(node_15, () => $$props.warningIcon ?? $.noop);
									$.append($$anchor, fragment_12);
								};

								var consequent_10 = ($$anchor) => {
									var fragment_13 = $.comment();
									var node_16 = $.first_child(fragment_13);

									$.snippet(node_16, () => $$props.infoIcon ?? $.noop);
									$.append($$anchor, fragment_13);
								};

								$.if(node_11, ($$render) => {
									if ($$props.toast.icon) $$render(consequent_6); else if ($.get(toastType) === 'success') $$render(consequent_7, 1); else if ($.get(toastType) === 'error') $$render(consequent_8, 2); else if ($.get(toastType) === 'warning') $$render(consequent_9, 3); else if ($.get(toastType) === 'info') $$render(consequent_10, 4);
								});
							}

							$.append($$anchor, fragment_8);
						};

						$.if(node_10, ($$render) => {
							if ($.get(toastType) !== 'loading') $$render(consequent_11);
						});
					}

					$.reset(div_1);

					$.template_effect(($0) => $.set_class(div_1, 1, $0), [
						() => $.clsx(cn($.get(classes)?.icon, $$props.toast?.classes?.icon))
					]);

					$.append($$anchor, div_1);
				};

				$.if(node_6, ($$render) => {
					if (($.get(toastType) || $$props.toast.icon || $$props.toast.promise) && $$props.toast.icon !== null && ($.get(icon) !== null || $$props.toast.icon)) $$render(consequent_12);
				});
			}

			var div_2 = $.sibling(node_6, 2);
			var div_3 = $.child(div_2);
			var node_17 = $.child(div_3);

			{
				var consequent_14 = ($$anchor) => {
					var fragment_14 = $.comment();
					var node_18 = $.first_child(fragment_14);

					{
						var consequent_13 = ($$anchor) => {
							const Title = $.derived(() => $$props.toast.title);
							var fragment_15 = $.comment();
							var node_19 = $.first_child(fragment_15);

							$.component(node_19, () => $.get(Title), ($$anchor, Title_1) => {
								Title_1($$anchor, $.spread_props(() => $$props.toast.componentProps));
							});

							$.append($$anchor, fragment_15);
						};

						var alternate_2 = ($$anchor) => {
							var text = $.text();

							$.template_effect(() => $.set_text(text, $$props.toast.title));
							$.append($$anchor, text);
						};

						$.if(node_18, ($$render) => {
							if (typeof $$props.toast.title !== 'string') $$render(consequent_13); else $$render(alternate_2, -1);
						});
					}

					$.append($$anchor, fragment_14);
				};

				$.if(node_17, ($$render) => {
					if ($$props.toast.title) $$render(consequent_14);
				});
			}

			$.reset(div_3);

			var node_20 = $.sibling(div_3, 2);

			{
				var consequent_16 = ($$anchor) => {
					var div_4 = root_3();
					var node_21 = $.child(div_4);

					{
						var consequent_15 = ($$anchor) => {
							const Description = $.derived(() => $$props.toast.description);
							var fragment_17 = $.comment();
							var node_22 = $.first_child(fragment_17);

							$.component(node_22, () => $.get(Description), ($$anchor, Description_1) => {
								Description_1($$anchor, $.spread_props(() => $$props.toast.componentProps));
							});

							$.append($$anchor, fragment_17);
						};

						var alternate_3 = ($$anchor) => {
							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $$props.toast.description));
							$.append($$anchor, text_1);
						};

						$.if(node_21, ($$render) => {
							if (typeof $$props.toast.description !== 'string') $$render(consequent_15); else $$render(alternate_3, -1);
						});
					}

					$.reset(div_4);

					$.template_effect(($0) => $.set_class(div_4, 1, $0), [
						() => $.clsx(cn(descriptionClass(), $.get(toastDescriptionClass), $.get(classes)?.description, $$props.toast.classes?.description))
					]);

					$.append($$anchor, div_4);
				};

				$.if(node_20, ($$render) => {
					if ($$props.toast.description) $$render(consequent_16);
				});
			}

			$.reset(div_2);

			var node_23 = $.sibling(div_2, 2);

			{
				var consequent_19 = ($$anchor) => {
					var fragment_19 = $.comment();
					var node_24 = $.first_child(fragment_19);

					{
						var consequent_17 = ($$anchor) => {
							var fragment_20 = $.comment();
							var node_25 = $.first_child(fragment_20);

							$.component(node_25, () => $$props.toast.cancel, ($$anchor, toast_cancel) => {
								toast_cancel($$anchor, {});
							});

							$.append($$anchor, fragment_20);
						};

						var consequent_18 = ($$anchor) => {
							var button_1 = root_4();
							var text_2 = $.only_child(button_1, true);

							$.template_effect(
								($0) => {
									$.set_style(button_1, $$props.toast.cancelButtonStyle ?? cancelButtonStyle());
									$.set_class(button_1, 1, $0);
									$.set_text(text_2, $$props.toast.cancel.label);
								},
								[
									() => $.clsx(cn($.get(classes)?.cancelButton, $$props.toast?.classes?.cancelButton))
								]
							);

							$.delegated('click', button_1, (event) => {
								if (!isAction($$props.toast.cancel)) return;
								if (!$.get(dismissible)) return;

								$$props.toast.cancel?.onClick?.(event);
								deleteToast();
							});

							$.append($$anchor, button_1);
						};

						var d = $.derived(() => isAction($$props.toast.cancel));

						$.if(node_24, ($$render) => {
							if (typeof $$props.toast.cancel === 'function') $$render(consequent_17); else if ($.get(d)) $$render(consequent_18, 1);
						});
					}

					$.append($$anchor, fragment_19);
				};

				$.if(node_23, ($$render) => {
					if ($$props.toast.cancel) $$render(consequent_19);
				});
			}

			var node_26 = $.sibling(node_23, 2);

			{
				var consequent_22 = ($$anchor) => {
					var fragment_21 = $.comment();
					var node_27 = $.first_child(fragment_21);

					{
						var consequent_20 = ($$anchor) => {
							var fragment_22 = $.comment();
							var node_28 = $.first_child(fragment_22);

							$.component(node_28, () => $$props.toast.action, ($$anchor, toast_action) => {
								toast_action($$anchor, {});
							});

							$.append($$anchor, fragment_22);
						};

						var consequent_21 = ($$anchor) => {
							var button_2 = root_5();
							var text_3 = $.only_child(button_2, true);

							$.template_effect(
								($0) => {
									$.set_style(button_2, $$props.toast.actionButtonStyle ?? actionButtonStyle());
									$.set_class(button_2, 1, $0);
									$.set_text(text_3, $$props.toast.action.label);
								},
								[
									() => $.clsx(cn($.get(classes)?.actionButton, $$props.toast?.classes?.actionButton))
								]
							);

							$.delegated('click', button_2, (event) => {
								if (!isAction($$props.toast.action)) return;

								$$props.toast.action?.onClick(event);

								if (event.defaultPrevented) return;

								deleteToast();
							});

							$.append($$anchor, button_2);
						};

						var d_1 = $.derived(() => isAction($$props.toast.action));

						$.if(node_27, ($$render) => {
							if (typeof $$props.toast.action === 'function') $$render(consequent_20); else if ($.get(d_1)) $$render(consequent_21, 1);
						});
					}

					$.append($$anchor, fragment_21);
				};

				$.if(node_26, ($$render) => {
					if ($$props.toast.action) $$render(consequent_22);
				});
			}

			$.template_effect(
				($0, $1) => {
					$.set_class(div_2, 1, $0);
					$.set_class(div_3, 1, $1);
				},
				[
					() => $.clsx(cn($.get(classes)?.content, $$props.toast?.classes?.content)),
					() => $.clsx(cn($.get(classes)?.title, $$props.toast?.classes?.title))
				]
			);

			$.append($$anchor, fragment_3);
		};

		$.if(node_4, ($$render) => {
			if ($$props.toast.component) $$render(consequent_2); else $$render(alternate_4, -1);
		});
	}

	$.reset(li);
	$.bind_this(li, ($$value) => $.set(toastRef, $$value), () => $.get(toastRef));

	$.template_effect(
		($0, $1, $2) => {
			$.set_class(li, 1, $0);
			$.set_attribute(li, 'aria-live', $$props.toast.important ? 'assertive' : 'polite');
			$.set_attribute(li, 'data-rich-colors', $$props.toast.richColors ?? defaultRichColors());
			$.set_attribute(li, 'data-styled', !($$props.toast.component || $$props.toast.unstyled || unstyled()));
			$.set_attribute(li, 'data-mounted', $.get(mounted));
			$.set_attribute(li, 'data-promise', $1);
			$.set_attribute(li, 'data-swiped', $.get(isSwiped));
			$.set_attribute(li, 'data-removed', $.get(removed));
			$.set_attribute(li, 'data-visible', $.get(isVisible));
			$.set_attribute(li, 'data-y-position', $.get(coords)[0]);
			$.set_attribute(li, 'data-x-position', $.get(coords)[1]);
			$.set_attribute(li, 'data-index', $$props.index);
			$.set_attribute(li, 'data-front', $.get(isFront));
			$.set_attribute(li, 'data-swiping', $.get(swiping));
			$.set_attribute(li, 'data-dismissible', $.get(dismissible));
			$.set_attribute(li, 'data-type', $.get(toastType));
			$.set_attribute(li, 'data-invert', $.get(invert));
			$.set_attribute(li, 'data-swipe-out', $.get(swipeOut));
			$.set_attribute(li, 'data-swipe-direction', $.get(swipeOutDirection));
			$.set_attribute(li, 'data-expanded', $2);

			styles = $.set_style(li, `${$$props.style} ${$$props.toast.style}`, styles, {
				'--index': $$props.index,
				'--toasts-before': $$props.index,
				'--z-index': toastState.toasts.length - $$props.index,
				'--offset': `${$.get(removed) ? $.get(offsetBeforeRemove) : $.get(offset)}px`,
				'--initial-height': $$props.expandByDefault ? 'auto' : `${$.get(initialHeight)}px`
			});
		},
		[
			() => $.clsx(cn($$props.class, $.get(toastClass), $.get(classes)?.toast, $$props.toast?.classes?.toast, $.get(classes)?.[$.get(toastType)], $$props.toast?.classes?.[$.get(toastType)])),
			() => Boolean($$props.toast.promise),
			() => Boolean($$props.expanded || $$props.expandByDefault && $.get(mounted))
		]
	);

	$.delegated('pointermove', li, handlePointerMove);
	$.delegated('pointerup', li, handlePointerUp);
	$.delegated('pointerdown', li, handlePointerDown);
	$.event('dragend', li, handleDragEnd);
	$.append($$anchor, li);
	$.pop();
}

$.delegate(['pointermove', 'pointerup', 'pointerdown', 'click']);