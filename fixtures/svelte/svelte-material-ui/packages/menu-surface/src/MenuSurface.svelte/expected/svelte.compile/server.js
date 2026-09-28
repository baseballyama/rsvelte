import * as $ from 'svelte/internal/server';
import { onMount, setContext, getContext } from 'svelte';
import { classMap, useActions, dispatch, SvelteEventManager } from '@smui/common/internal';
import { MDCMenuSurfaceFoundation } from './mdc';
import { Corner } from './MenuSurface.types.js';

export default function MenuSurface($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * A list of CSS styles.
		 */
		/**
		 * A static menu is always open.
		 */
		/**
		 * Anchor the menu surface automatically to its parent element.
		 *
		 * If you set this to false, you need to provide an element to
		 * `anchorElement`.
		 */
		/**
		 * Set the menu surface calculations based on a fixed position menu.
		 */
		/**
		 * Whether the menu surface is open.
		 */
		/**
		 * A managed menu surface means you completely control the open state. The
		 * component will never alter it on its own.
		 */
		/**
		 * Set width to 100%.
		 */
		/**
		 * Skip animating when the menu surface opens.
		 */
		/**
		 * The element to anchor the menu to, if not done automatically.
		 *
		 * You should only need this if you set `anchor` to false.
		 */
		/**
		 * Default anchor corner alignment of top left menu surface corner.
		 */
		/**
		 * The margin to put between the anchor and the menu.
		 */
		/**
		 * The maximum height to allow the menu surface to be.
		 */
		/**
		 * Whether menu-surface should be horizontally centered to viewport.
		 *
		 * (Only effective when the menu surface is hoisted to the body.)
		 */
		/**
		 * Set to a positive integer to influence the menu to preferentially open
		 * below the anchor instead of above.
		 *
		 * A value of `x` simulates an extra `x` pixels of available space below the
		 * menu during positioning calculations.
		 */
		/**
		 * Set this to true to never restore focus to the previously focused element
		 * when the menu is closed.
		 */
		let {
			use = [],
			class: className = '',
			style = '',
			static: isStatic = false,
			anchor = true,
			fixed = false,
			open = isStatic,
			managed = false,
			fullWidth = false,
			quickOpen = false,
			anchorElement = void 0,
			anchorCorner,
			anchorMargin = { top: 0, right: 0, bottom: 0, left: 0 },
			maxHeight = 0,
			horizontallyCenteredOnViewport = false,
			openBottomBias = 0,
			neverRestoreFocus = false,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let eventManager = new SvelteEventManager();
		let internalClasses = {};
		let internalStyles = {};
		let previousFocus = undefined;

		setContext('SMUI:list:role', 'menu');
		setContext('SMUI:list:item:role', 'menuitem');

		const iCorner = Corner;
		const SMUIMenuSurfaceMount = getContext('SMUI:menu-surface:mount');
		const SMUIMenuSurfaceUnmount = getContext('SMUI:menu-surface:unmount');

		onMount(() => {
			instance = new MDCMenuSurfaceFoundation({
				addClass,
				removeClass,
				hasClass,
				hasAnchor: () => !!anchorElement,
				notifyClose: () => {
					if (!managed) {
						open = isStatic;
					}

					if (!open && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceClosed');
					}
				},

				notifyClosing: () => {
					if (!managed) {
						open = isStatic;
					}

					if (!open && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceClosing');
					}
				},

				notifyOpen: () => {
					if (!managed) {
						open = true;
					}

					if (open && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceOpened');
					}
				},

				notifyOpening: () => {
					if (!open && getElement()) {
						dispatch(getElement(), 'SMUIMenuSurfaceOpening');
					}
				},
				isElementInContainer: (el) => getElement()?.contains(el) ?? false,
				isRtl: () => getElement() && getComputedStyle(getElement()).getPropertyValue('direction') === 'rtl',
				setTransformOrigin: (origin) => {
					internalStyles['transform-origin'] = origin;
				},
				isFocused: () => document.activeElement === getElement(),
				saveFocus: () => {
					previousFocus = document.activeElement ?? undefined;
				},

				restoreFocus: () => {
					if (!neverRestoreFocus && (!element || getElement()?.contains(document.activeElement)) && previousFocus && document.contains(previousFocus) && 'focus' in previousFocus) {
						previousFocus.focus();
					}
				},

				getInnerDimensions: () => {
					return {
						width: getElement()?.offsetWidth ?? 0,
						height: getElement()?.offsetHeight ?? 0
					};
				},
				getAnchorDimensions: () => anchorElement ? anchorElement.getBoundingClientRect() : null,
				getViewportDimensions: () => {
					return { width: window.innerWidth, height: window.innerHeight };
				},

				getBodyDimensions: () => {
					return {
						width: document.body.clientWidth,
						height: document.body.clientHeight
					};
				},

				getWindowScroll: () => {
					return { x: window.pageXOffset, y: window.pageYOffset };
				},

				setPosition: (position) => {
					internalStyles.left = 'left' in position ? `${position.left}px` : '';
					internalStyles.right = 'right' in position ? `${position.right}px` : '';
					internalStyles.top = 'top' in position ? `${position.top}px` : '';
					internalStyles.bottom = 'bottom' in position ? `${position.bottom}px` : '';
				},

				setMaxHeight: (height) => {
					internalStyles['max-height'] = height;
				},
				registerWindowEventHandler: (evt, handler) => eventManager.on(window, evt, handler),
				deregisterWindowEventHandler: (evt, handler) => eventManager.off(window, evt, handler)
			});

			const accessor = {
				get open() {
					return open;
				},

				set open(value) {
					open = value;
				},
				closeProgrammatic
			};

			SMUIMenuSurfaceMount && SMUIMenuSurfaceMount(accessor);
			instance.init();

			return () => {
				SMUIMenuSurfaceUnmount && SMUIMenuSurfaceUnmount(accessor);

				if (anchor) {
					getElement() && getElement().parentElement?.classList.remove('mdc-menu-surface--anchor');
				}

				const isHoisted = instance.isHoistedElement;

				instance?.destroy();
				instance = undefined;

				if (isHoisted) {
					try {
						getElement()?.parentNode?.removeChild(getElement());
					} catch(e) {
						// Ignore error.
					}
				}
			};
		});

		function hasClass(className) {
			return className in internalClasses
				? internalClasses[className]
				: getElement().classList.contains(className);
		}

		function addClass(className) {
			if (!internalClasses[className]) {
				internalClasses[className] = true;
			}
		}

		function removeClass(className) {
			if (!(className in internalClasses) || internalClasses[className]) {
				internalClasses[className] = false;
			}
		}

		function closeProgrammatic(skipRestoreFocus) {
			instance?.close(skipRestoreFocus);
			open = false;
		}

		function handleBodyClick(event) {
			if (instance && open && !managed) {
				instance.handleBodyClick(event);
			}
		}

		function isOpen() {
			return open;
		}

		function setOpen(value) {
			open = value;
		}

		function setAbsolutePosition(x, y) {
			if (instance == null) {
				throw new Error('Instance is not defined.');
			}

			return instance.setAbsolutePosition(x, y);
		}

		function setIsHoisted(isHoisted) {
			if (instance == null) {
				throw new Error('Instance is not defined.');
			}

			return instance.setIsHoisted(isHoisted);
		}

		function isFixed() {
			if (instance == null) {
				throw new Error('Instance is not defined.');
			}

			return instance.isFixed();
		}

		function flipCornerHorizontally() {
			if (instance == null) {
				throw new Error('Instance is not defined.');
			}

			return instance.flipCornerHorizontally();
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(classMap({
				'mdc-menu-surface': true,
				'mdc-menu-surface--fixed': fixed,
				'mdc-menu-surface--open': isStatic,
				'smui-menu-surface--static': isStatic,
				'mdc-menu-surface--fullwidth': fullWidth,
				...internalClasses,
				[className]: true
			})),
			style: Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style]).join(' '),
			role: 'dialog',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);

		$.bind_props($$props, {
			open,
			anchorElement,
			isOpen,
			setOpen,
			setAbsolutePosition,
			setIsHoisted,
			isFixed,
			flipCornerHorizontally,
			getElement
		});
	});
}