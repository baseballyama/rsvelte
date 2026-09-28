import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'invert',
	'position',
	'hotkey',
	'expand',
	'closeButton',
	'offset',
	'mobileOffset',
	'theme',
	'richColors',
	'duration',
	'visibleToasts',
	'toastOptions',
	'dir',
	'gap',
	'swipeDirections',
	'pauseWhenPageIsHidden',
	'loadingIcon',
	'successIcon',
	'errorIcon',
	'warningIcon',
	'closeIcon',
	'infoIcon',
	'containerAriaLabel',
	'class',
	'closeButtonAriaLabel',
	'onblur',
	'onfocus',
	'onmouseenter',
	'onmousemove',
	'onmouseleave',
	'ondragend',
	'onpointerdown',
	'onpointerup'
]);

var root = $.from_html(`<ol></ol>`);
var root_1 = $.from_html(`<section aria-live="polite" aria-relevant="additions text" aria-atomic="false"><!></section>`);

export default function Toaster($$anchor, $$props) {
	$.push($$props, true);

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

	let invert = $.prop($$props, 'invert', 3, false),
		position = $.prop($$props, 'position', 3, 'bottom-right'),
		hotkey = $.prop($$props, 'hotkey', 19, () => ['altKey', 'KeyT']),
		expand = $.prop($$props, 'expand', 3, false),
		closeButton = $.prop($$props, 'closeButton', 3, false),
		offset = $.prop($$props, 'offset', 3, VIEWPORT_OFFSET),
		mobileOffset = $.prop($$props, 'mobileOffset', 3, MOBILE_VIEWPORT_OFFSET),
		theme = $.prop($$props, 'theme', 3, 'light'),
		richColors = $.prop($$props, 'richColors', 3, false),
		duration = $.prop($$props, 'duration', 3, TOAST_LIFETIME),
		visibleToasts = $.prop($$props, 'visibleToasts', 3, VISIBLE_TOASTS_AMOUNT),
		toastOptions = $.prop($$props, 'toastOptions', 19, () => ({})),
		dir = $.prop($$props, 'dir', 7, 'auto'),
		gap = $.prop($$props, 'gap', 3, GAP),
		pauseWhenPageIsHidden = $.prop($$props, 'pauseWhenPageIsHidden', 3, false),
		containerAriaLabel = $.prop($$props, 'containerAriaLabel', 3, 'Notifications'),
		closeButtonAriaLabel = $.prop($$props, 'closeButtonAriaLabel', 3, 'Close toast'),
		restProps = $.rest_props($$props, rest_excludes);

	function getDocumentDirection() {
		if (dir() !== 'auto') return dir();
		if (typeof window === 'undefined') return 'ltr';
		if (typeof document === 'undefined') return 'ltr'; // For Fresh purpose

		const dirAttribute = document.documentElement.getAttribute('dir');

		if (dirAttribute === 'auto' || !dirAttribute) {
			untrack(() => dir(window.getComputedStyle(document.documentElement).direction ?? 'ltr'));

			return dir();
		}

		untrack(() => dir(dirAttribute));

		return dirAttribute;
	}

	// The slice of the shared toast state this toaster renders: an id-less toaster
	// shows only toasts without a toasterId (upstream sonner semantics).
	const filteredToasts = $.derived(() => $$props.id
		? toastState.toasts.filter((toast) => toast.toasterId === $$props.id)
		: toastState.toasts.filter((toast) => !toast.toasterId));

	const possiblePositions = $.derived(() => Array.from(new Set([
		position(),
		...$.get(filteredToasts).filter((toast) => toast.position).map((toast) => toast.position)
	].filter(Boolean))));

	let expanded = $.state(false);
	let interacting = $.state(false);
	let actualTheme = $.state($.proxy(getInitialTheme(theme())));
	let listRef = $.state(void 0);
	let lastFocusedElementRef = $.state(null);
	let isFocusWithin = $.state(false);
	let lastMousePosition = null;
	const hotkeyLabel = $.derived(() => hotkey().join('+').replace(/Key/g, '').replace(/Digit/g, ''));

	$.user_effect(() => {
		if ($.get(filteredToasts).length <= 1) {
			$.set(expanded, false);
		}
	});

	// Check for dismissed toasts and remove them. We need to do this to have dismiss animation.
	$.user_effect(() => {
		const toastsToDismiss = $.get(filteredToasts).filter((toast) => toast.dismiss && !toast.delete);

		if (toastsToDismiss.length > 0) {
			const updatedToasts = toastState.toasts.map((toast) => {
				const matchingToast = toastsToDismiss.find((dismissToast) => dismissToast.id === toast.id);

				if (matchingToast) {
					return { ...toast, delete: true };
				}

				return toast;
			});

			toastState.toasts = updatedToasts;
		}
	});

	$.user_effect(() => {
		return () => {
			if ($.get(listRef) && $.get(lastFocusedElementRef)) {
				$.get(lastFocusedElementRef).focus({ preventScroll: true });
				$.set(lastFocusedElementRef, null);
				$.set(isFocusWithin, false);
			}
		};
	});

	onMount(() => {
		const handleKeydown = (event) => {
			const isHotkeyPressed = hotkey().every((key

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			) => event[key] || event.code === key);

			if (isHotkeyPressed) {
				$.set(expanded, true);
				$.get(listRef)?.focus();
			}

			if (event.code === 'Escape' && (document.activeElement === $.get(listRef) || $.get(listRef)?.contains(document.activeElement))) {
				$.set(expanded, false);
			}
		};

		return on(document, 'keydown', handleKeydown);
	});

	$.user_effect(() => {
		if (theme() !== 'system') {
			$.set(actualTheme, theme());
		}

		if (typeof window !== 'undefined') {
			if (theme() === 'system') {
				if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
					$.set(actualTheme, DARK);
				} else {
					$.set(actualTheme, LIGHT);
				}
			}

			const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

			const changeHandler = ({ matches }) => {
				if (theme() !== 'system') return;

				$.set(actualTheme, matches ? DARK : LIGHT, true);
			};

			if ('addEventListener' in mediaQueryList) {
				mediaQueryList.addEventListener('change', changeHandler);
			} else {
				// @ts-expect-error deprecated API
				mediaQueryList.addListener(changeHandler);
			}
		}
	});

	const handleBlur = (event) => {
		$$props.onblur?.(event);

		if ($.get(isFocusWithin) && !event.currentTarget.contains(event.relatedTarget)) {
			$.set(isFocusWithin, false);

			if ($.get(lastFocusedElementRef)) {
				$.get(lastFocusedElementRef).focus({ preventScroll: true });
				$.set(lastFocusedElementRef, null);
			}
		}
	};

	const handleFocus = (event) => {
		$$props.onfocus?.(event);

		const isNotDismissable = event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

		if (isNotDismissable) return;

		if (!$.get(isFocusWithin)) {
			$.set(isFocusWithin, true);
			$.set(lastFocusedElementRef, event.relatedTarget, true);
		}
	};

	const handlePointerDown = (event) => {
		$$props.onpointerdown?.(event);

		const isNotDismissable = event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

		if (isNotDismissable) return;

		$.set(interacting, true);
	};

	const handleMouseEnter = (event) => {
		$$props.onmouseenter?.(event);
		lastMousePosition = { x: event.clientX, y: event.clientY };
		$.set(expanded, true);
	};

	const handleMouseLeave = (event) => {
		$$props.onmouseleave?.(event);

		// fix firefox firing mouseleave when the toast is closed by clicking
		// the close button and the toast leaves the mouse position. This doesn't
		// happen on other browsers, since the mouse wasn't moved by the user.
		// so we only collapse if mouse actually moved from last known position
		const currentPosition = { x: event.clientX, y: event.clientY };

		const mouseActuallyMoved = !lastMousePosition || Math.abs(currentPosition.x - lastMousePosition.x) > 1 || Math.abs(currentPosition.y - lastMousePosition.y) > 1;

		if (!$.get(interacting) && mouseActuallyMoved) {
			$.set(expanded, false);
		}
	};

	const handleMouseMove = (event) => {
		$$props.onmousemove?.(event);
		lastMousePosition = { x: event.clientX, y: event.clientY };
		$.set(expanded, true);
	};

	const handleDragEnd = (event) => {
		$$props.ondragend?.(event);
		$.set(expanded, false);
	};

	const handlePointerUp = (event) => {
		$$props.onpointerup?.(event);
		$.set(interacting, false);
	};

	sonnerContext.set(new SonnerState());

	var section = root_1();

	$.set_attribute(section, 'tabindex', -1);

	var node = $.child(section);

	{
		var consequent_10 = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 18, () => $.get(possiblePositions), (position) => position, ($$anchor, position, index, $$array) => {
				const computed_const = $.derived(() => {
					const [y, x] = position.split('-');

					return { y, x };
				});

				const offsetObject = $.derived(() => getOffsetObject(offset(), mobileOffset()));
				const frontHeight = $.derived(() => toastState.heights.find((height) => height.toasterId === $$props.id && height.position === position)?.height ?? 0);
				var ol = root();

				$.attribute_effect(
					ol,
					($0) => ({
						tabindex: -1,
						dir: $0,
						class: $$props.class,
						'data-sonner-toaster': true,
						'data-sonner-theme': $.get(actualTheme),
						'data-y-position': $.get(computed_const).y,
						'data-x-position': $.get(computed_const).x,
						style: $$props.style,
						onblur: handleBlur,
						onfocus: handleFocus,
						onmouseenter: handleMouseEnter,
						onmousemove: handleMouseMove,
						onmouseleave: handleMouseLeave,
						ondragend: handleDragEnd,
						onpointerdown: handlePointerDown,
						onpointerup: handlePointerUp,
						...restProps,
						[$.STYLE]: {
							'--front-toast-height': `${$.get(frontHeight)}px`,
							'--width': `${TOAST_WIDTH}px`,
							'--gap': `${gap()}px`,
							'--offset-top': $.get(offsetObject)['--offset-top'],
							'--offset-right': $.get(offsetObject)['--offset-right'],
							'--offset-bottom': $.get(offsetObject)['--offset-bottom'],
							'--offset-left': $.get(offsetObject)['--offset-left'],
							'--mobile-offset-top': $.get(offsetObject)['--mobile-offset-top'],
							'--mobile-offset-right': $.get(offsetObject)['--mobile-offset-right'],
							'--mobile-offset-bottom': $.get(offsetObject)['--mobile-offset-bottom'],
							'--mobile-offset-left': $.get(offsetObject)['--mobile-offset-left']
						}
					}),
					[() => getDocumentDirection()]
				);

				$.each(ol, 23, () => $.get(filteredToasts).filter((toast) => !toast.position && $.get(index) === 0 || toast.position === position), (toast) => toast.id, ($$anchor, toast, index, $$array_1) => {
					{
						const successIcon = ($$anchor) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							{
								var consequent = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_3 = $.first_child(fragment_3);

									$.snippet(node_3, () => $$props.successIcon ?? $.noop);
									$.append($$anchor, fragment_3);
								};

								var consequent_1 = ($$anchor) => {
									SuccessIcon($$anchor, {});
								};

								$.if(node_2, ($$render) => {
									if ($$props.successIcon) $$render(consequent); else if ($$props.successIcon !== null) $$render(consequent_1, 1);
								});
							}

							$.append($$anchor, fragment_2);
						};

						const errorIcon = ($$anchor) => {
							var fragment_5 = $.comment();
							var node_4 = $.first_child(fragment_5);

							{
								var consequent_2 = ($$anchor) => {
									var fragment_6 = $.comment();
									var node_5 = $.first_child(fragment_6);

									$.snippet(node_5, () => $$props.errorIcon ?? $.noop);
									$.append($$anchor, fragment_6);
								};

								var consequent_3 = ($$anchor) => {
									ErrorIcon($$anchor, {});
								};

								$.if(node_4, ($$render) => {
									if ($$props.errorIcon) $$render(consequent_2); else if ($$props.errorIcon !== null) $$render(consequent_3, 1);
								});
							}

							$.append($$anchor, fragment_5);
						};

						const warningIcon = ($$anchor) => {
							var fragment_8 = $.comment();
							var node_6 = $.first_child(fragment_8);

							{
								var consequent_4 = ($$anchor) => {
									var fragment_9 = $.comment();
									var node_7 = $.first_child(fragment_9);

									$.snippet(node_7, () => $$props.warningIcon ?? $.noop);
									$.append($$anchor, fragment_9);
								};

								var consequent_5 = ($$anchor) => {
									WarningIcon($$anchor, {});
								};

								$.if(node_6, ($$render) => {
									if ($$props.warningIcon) $$render(consequent_4); else if ($$props.warningIcon !== null) $$render(consequent_5, 1);
								});
							}

							$.append($$anchor, fragment_8);
						};

						const infoIcon = ($$anchor) => {
							var fragment_11 = $.comment();
							var node_8 = $.first_child(fragment_11);

							{
								var consequent_6 = ($$anchor) => {
									var fragment_12 = $.comment();
									var node_9 = $.first_child(fragment_12);

									$.snippet(node_9, () => $$props.infoIcon ?? $.noop);
									$.append($$anchor, fragment_12);
								};

								var consequent_7 = ($$anchor) => {
									InfoIcon($$anchor, {});
								};

								$.if(node_8, ($$render) => {
									if ($$props.infoIcon) $$render(consequent_6); else if ($$props.infoIcon !== null) $$render(consequent_7, 1);
								});
							}

							$.append($$anchor, fragment_11);
						};

						const closeIcon = ($$anchor) => {
							var fragment_14 = $.comment();
							var node_10 = $.first_child(fragment_14);

							{
								var consequent_8 = ($$anchor) => {
									var fragment_15 = $.comment();
									var node_11 = $.first_child(fragment_15);

									$.snippet(node_11, () => $$props.closeIcon ?? $.noop);
									$.append($$anchor, fragment_15);
								};

								var consequent_9 = ($$anchor) => {
									CloseIcon($$anchor, {});
								};

								$.if(node_10, ($$render) => {
									if ($$props.closeIcon) $$render(consequent_8); else if ($$props.closeIcon !== null) $$render(consequent_9, 1);
								});
							}

							$.append($$anchor, fragment_14);
						};

						let $0 = $.derived(() => toastOptions()?.duration ?? duration());
						let $1 = $.derived(() => toastOptions()?.class ?? '');
						let $2 = $.derived(() => toastOptions()?.descriptionClass || '');
						let $3 = $.derived(() => toastOptions()?.closeButton ?? closeButton());
						let $4 = $.derived(() => toastOptions()?.style ?? '');
						let $5 = $.derived(() => toastOptions().classes || {});
						let $6 = $.derived(() => toastOptions().unstyled ?? false);
						let $7 = $.derived(() => toastOptions()?.cancelButtonStyle ?? '');
						let $8 = $.derived(() => toastOptions()?.actionButtonStyle ?? '');
						let $9 = $.derived(() => toastOptions()?.closeButtonAriaLabel ?? closeButtonAriaLabel());

						Toast($$anchor, {
							get index() {
								return $.get(index);
							},

							get toast() {
								return $.get(toast);
							},

							get defaultRichColors() {
								return richColors();
							},

							get duration() {
								return $.get($0);
							},

							get class() {
								return $.get($1);
							},

							get descriptionClass() {
								return $.get($2);
							},

							get invert() {
								return invert();
							},

							get visibleToasts() {
								return visibleToasts();
							},

							get closeButton() {
								return $.get($3);
							},

							get interacting() {
								return $.get(interacting);
							},

							get position() {
								return position;
							},

							get gap() {
								return gap();
							},

							get style() {
								return $.get($4);
							},

							get classes() {
								return $.get($5);
							},

							get unstyled() {
								return $.get($6);
							},

							get cancelButtonStyle() {
								return $.get($7);
							},

							get actionButtonStyle() {
								return $.get($8);
							},

							get closeButtonAriaLabel() {
								return $.get($9);
							},

							get expandByDefault() {
								return expand();
							},

							get expanded() {
								return $.get(expanded);
							},

							get swipeDirections() {
								return $$props.swipeDirections;
							},

							get pauseWhenPageIsHidden() {
								return pauseWhenPageIsHidden();
							},

							get loadingIcon() {
								return $$props.loadingIcon;
							},
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
				});

				$.reset(ol);
				$.bind_this(ol, ($$value) => $.set(listRef, $$value), () => $.get(listRef));
				$.template_effect(() => ol.dir = ol.dir);
				$.append($$anchor, ol);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(filteredToasts).length > 0) $$render(consequent_10);
		});
	}

	$.reset(section);
	$.template_effect(() => $.set_attribute(section, 'aria-label', `${containerAriaLabel() ?? ''} ${$.get(hotkeyLabel) ?? ''}`));
	$.append($$anchor, section);
	$.pop();
}