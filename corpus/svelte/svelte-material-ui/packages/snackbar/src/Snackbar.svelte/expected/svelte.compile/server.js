import * as $ from 'svelte/internal/server';
import { onMount, setContext } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import { MDCSnackbarFoundation, util } from './mdc';

let waiting = Promise.resolve();

export default function Snackbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { closest } = ponyfill;
		let uninitializedValue = () => {};

		function isUninitializedValue(value) {
			return value === uninitializedValue;
		}

		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		/**
		 * The styling variant of the snackbar.
		 *
		 * Undefined is the default variant. Stacked means the text goes above the
		 * actions and icons.
		 */
		/**
		 * Whether to position the snackbar in the leading portion of the screen.
		 */
		/**
		 * How many milliseconds to wait before automatically closing.
		 */
		/**
		 * Whether to close the snackbar when the escape key is pressed.
		 *
		 * This only works when an element inside the snackbar has focus.
		 */
		/**
		 * Text content to place in the label.
		 */
		/**
		 * Text content to place in the action button.
		 */
		/**
		 * An array of Action or [Action, ActionProps] to be applied to the element.
		 */
		/**
		 * A space separated list of CSS classes.
		 */
		let {
			use = [],
			class: className = '',
			variant,
			leading = false,
			timeoutMs = 5000,
			closeOnEscape = true,
			labelText = uninitializedValue,
			actionButtonText = uninitializedValue,
			surface$use = [],
			surface$class = '',
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let element;
		let instance = void 0;
		let internalClasses = {};
		let closeResolve;
		let closePromise = new Promise((resolve) => closeResolve = resolve);

		setContext('SMUI:label:context', 'snackbar');

		onMount(() => {
			instance = new MDCSnackbarFoundation({
				addClass,
				announce: () => util.announce(getLabelElement()),
				notifyClosed: (reason) => dispatch(getElement(), 'SMUISnackbarClosed', reason ? { reason } : {}),
				notifyClosing: (reason) => dispatch(getElement(), 'SMUISnackbarClosing', reason ? { reason } : {}),
				notifyOpened: () => dispatch(getElement(), 'SMUISnackbarOpened'),
				notifyOpening: () => dispatch(getElement(), 'SMUISnackbarOpening'),
				removeClass
			});

			instance.init();

			return () => {
				instance?.destroy();
				instance = undefined;
			};
		});

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

		function handleSurfaceClick(event) {
			const target = event.target;

			if (instance) {
				if (closest(target, '.mdc-snackbar__action')) {
					instance.handleActionButtonClick(event);
				} else if (closest(target, '.mdc-snackbar__dismiss')) {
					instance.handleActionIconClick(event);
				}
			}
		}

		function handleClosed() {
			closeResolve();
			closePromise = new Promise((resolve) => closeResolve = resolve);
		}

		function open() {
			waiting = waiting.then(() => {
				instance?.open();

				return closePromise;
			});
		}

		function forceOpen() {
			return instance?.open();
		}

		function close(reason) {
			return instance?.close(reason);
		}

		function isOpen() {
			if (instance == null) {
				throw new Error('Instance is undefined.');
			}

			return instance.isOpen();
		}

		function getLabelElement() {
			return getElement().querySelector('.mdc-snackbar__label') ?? document.createElement('div');
		}

		function getActionButtonElement() {
			return getElement().querySelector('.mdc-snackbar__action') ?? document.createElement('button');
		}

		function getElement() {
			return element;
		}

		$$renderer.push(`<aside${$.attributes({
			class: $.clsx(classMap({
				'mdc-snackbar': true,
				'mdc-snackbar--stacked': variant === 'stacked',
				'mdc-snackbar--leading': leading,
				...internalClasses,
				[className]: true
			})),
			...exclude(restProps, ['surface$'])
		})}><div${$.attributes({
			class: $.clsx(classMap({ 'mdc-snackbar__surface': true, [surface$class]: true })),
			role: 'status',
			'aria-relevant': 'additions',
			...prefixFilter(restProps, 'surface$')
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div></aside>`);

		$.bind_props($$props, {
			open,
			forceOpen,
			close,
			isOpen,
			getLabelElement,
			getActionButtonElement,
			getElement
		});
	});
}