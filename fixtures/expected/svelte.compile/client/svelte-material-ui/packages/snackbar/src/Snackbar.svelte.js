import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, setContext } from 'svelte';
import { ponyfill } from '@smui/common/dom';
import { classMap, exclude, prefixFilter, useActions, dispatch } from '@smui/common/internal';
import { MDCSnackbarFoundation, util } from './mdc';

let waiting = Promise.resolve();

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'variant',
	'leading',
	'timeoutMs',
	'closeOnEscape',
	'labelText',
	'actionButtonText',
	'surface$use',
	'surface$class',
	'children'
]);

var root = $.from_html(`<aside><div><!></div></aside>`);

export default function Snackbar($$anchor, $$props) {
	$.push($$props, true);

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
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		leading = $.prop($$props, 'leading', 3, false),
		timeoutMs = $.prop($$props, 'timeoutMs', 3, 5000),
		closeOnEscape = $.prop($$props, 'closeOnEscape', 3, true),
		labelText = $.prop($$props, 'labelText', 3, uninitializedValue),
		actionButtonText = $.prop($$props, 'actionButtonText', 3, uninitializedValue),
		surface$use = $.prop($$props, 'surface$use', 19, () => []),
		surface$class = $.prop($$props, 'surface$class', 3, ''),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let closeResolve;
	let closePromise = new Promise((resolve) => closeResolve = resolve);

	setContext('SMUI:label:context', 'snackbar');

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getTimeoutMs() !== timeoutMs()) {
			$.get(instance).setTimeoutMs(timeoutMs());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getCloseOnEscape() !== closeOnEscape()) {
			$.get(instance).setCloseOnEscape(closeOnEscape());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && !isUninitializedValue(labelText()) && getLabelElement().textContent !== labelText()) {
			getLabelElement().textContent = labelText();
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && !isUninitializedValue(actionButtonText()) && getActionButtonElement().textContent !== actionButtonText()) {
			getActionButtonElement().textContent = actionButtonText();
		}
	});

	onMount(() => {
		$.set(
			instance,
			new MDCSnackbarFoundation({
				addClass,
				announce: () => util.announce(getLabelElement()),
				notifyClosed: (reason) => dispatch(getElement(), 'SMUISnackbarClosed', reason ? { reason } : {}),
				notifyClosing: (reason) => dispatch(getElement(), 'SMUISnackbarClosing', reason ? { reason } : {}),
				notifyOpened: () => dispatch(getElement(), 'SMUISnackbarOpened'),
				notifyOpening: () => dispatch(getElement(), 'SMUISnackbarOpening'),
				removeClass
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
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

		if ($.get(instance)) {
			if (closest(target, '.mdc-snackbar__action')) {
				$.get(instance).handleActionButtonClick(event);
			} else if (closest(target, '.mdc-snackbar__dismiss')) {
				$.get(instance).handleActionIconClick(event);
			}
		}
	}

	function handleClosed() {
		closeResolve();
		closePromise = new Promise((resolve) => closeResolve = resolve);
	}

	function open() {
		waiting = waiting.then(() => {
			$.get(instance)?.open();

			return closePromise;
		});
	}

	function forceOpen() {
		return $.get(instance)?.open();
	}

	function close(reason) {
		return $.get(instance)?.close(reason);
	}

	function isOpen() {
		if ($.get(instance) == null) {
			throw new Error('Instance is undefined.');
		}

		return $.get(instance).isOpen();
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

	var $$exports = {
		open,
		forceOpen,
		close,
		isOpen,
		getLabelElement,
		getActionButtonElement,
		getElement
	};

	var aside = root();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleKeyDown(e);
		}

		$$props.onkeydown?.(e);
	};

	var event_handler_1 = (e) => {
		handleClosed();
		$$props.onSMUISnackbarClosed?.(e);
	};

	$.attribute_effect(
		aside,
		($0, $1) => ({
			class: $0,
			...$1,
			onkeydown: event_handler,
			onSMUISnackbarClosed: event_handler_1
		}),
		[
			() => classMap({
				'mdc-snackbar': true,
				'mdc-snackbar--stacked': $$props.variant === 'stacked',
				'mdc-snackbar--leading': leading(),
				...internalClasses,
				[className()]: true
			}),
			() => exclude(restProps, ['surface$'])
		]
	);

	var div = $.child(aside);

	var event_handler_2 = (e) => {
		handleSurfaceClick(e);
		$$props.surface$onclick?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			role: 'status',
			'aria-relevant': 'additions',
			...$1,
			onclick: event_handler_2
		}),
		[
			() => classMap({ 'mdc-snackbar__surface': true, [surface$class()]: true }),
			() => prefixFilter(restProps, 'surface$')
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), surface$use);
	$.reset(aside);
	$.bind_this(aside, ($$value) => element = $$value, () => element);
	$.action(aside, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, aside);

	return $.pop($$exports);
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
}