import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCLinearProgressFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'indeterminate',
	'closed',
	'progress',
	'buffer'
]);

var root = $.from_html(`<div><div class="mdc-linear-progress__buffer"><div class="mdc-linear-progress__buffer-bar"></div> <div class="mdc-linear-progress__buffer-dots"></div></div> <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"><span class="mdc-linear-progress__bar-inner"></span></div> <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"><span class="mdc-linear-progress__bar-inner"></span></div></div>`);

export default function LinearProgress($$anchor, $$props) {
	$.push($$props, true);

	const $closedStore = () => $.store_get(closedStore, '$closedStore', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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
	 * Whether to show indeterminate progress (a throbber).
	 */
	/**
	 * Whether the progress indicator is closed.
	 *
	 * Closed progress indicators animate out, then still take up space in the
	 * UI.
	 */
	/**
	 * The current progress (between 0 and 1).
	 */
	/**
	 * An optional buffer section of the progress bar.
	 *
	 * This can be used to show when, for example, a video has a current
	 * position and a buffered position.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		indeterminate = $.prop($$props, 'indeterminate', 3, false),
		closed = $.prop($$props, 'closed', 3, false),
		progress = $.prop($$props, 'progress', 3, 0),
		buffer = $.prop($$props, 'buffer', 3, undefined),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalAttrs = $.proxy({});
	let internalStyles = $.proxy({});
	let bufferBarStyles = $.proxy({});
	let primaryBarStyles = $.proxy({});
	let context = getContext('SMUI:linear-progress:context');
	let closedStore = getContext('SMUI:linear-progress:closed');

	$.user_effect(() => {
		if (closedStore) {
			$.store_set(closedStore, closed());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).isDeterminate() !== !indeterminate()) {
			$.get(instance).setDeterminate(!indeterminate());
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).getProgress() !== progress()) {
			$.get(instance).setProgress(progress());
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			if (buffer() == null) {
				$.get(instance).setBuffer(1);
			} else {
				$.get(instance).setBuffer(buffer());
			}
		}
	});

	$.user_effect(() => {
		if ($.get(instance)) {
			if (closed()) {
				$.get(instance).close();
			} else {
				$.get(instance).open();
			}
		}
	});

	onMount(() => {
		$.set(
			instance,
			new MDCLinearProgressFoundation({
				addClass,
				forceLayout: () => {
					getElement().getBoundingClientRect();
				},
				setBufferBarStyle: addBufferBarStyle,
				setPrimaryBarStyle: addPrimaryBarStyle,
				hasClass,
				removeAttribute: removeAttr,
				removeClass,
				setAttribute: addAttr,
				setStyle: addStyle,
				attachResizeObserver: (callback) => {
					const RO = window.ResizeObserver;

					if (RO) {
						const ro = new RO(callback);

						ro.observe(getElement());

						return ro;
					}

					return null;
				},
				getWidth: () => getElement().offsetWidth
			}),
			true
		);

		$.get(instance).init();

		return () => {
			$.get(instance)?.destroy();
			$.set(instance, undefined);
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

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
		}
	}

	function removeAttr(name) {
		if (!(name in internalAttrs) || internalAttrs[name] != null) {
			internalAttrs[name] = undefined;
		}
	}

	function addStyle(name, value) {
		if (internalStyles[name] != value) {
			if (value === '' || value == null) {
				delete internalStyles[name];
			} else {
				internalStyles[name] = value;
			}
		}
	}

	function addBufferBarStyle(name, value) {
		if (bufferBarStyles[name] != value) {
			if (value === '' || value == null) {
				delete bufferBarStyles[name];
			} else {
				bufferBarStyles[name] = value;
			}
		}
	}

	function addPrimaryBarStyle(name, value) {
		if (primaryBarStyles[name] != value) {
			if (value === '' || value == null) {
				delete primaryBarStyles[name];
			} else {
				primaryBarStyles[name] = value;
			}
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	var event_handler = (e) => {
		if ($.get(instance)) {
			$.get(instance).handleTransitionEnd();
		}

		$$props.ontransitionend?.(e);
	};

	$.attribute_effect(
		div,
		($0, $1) => ({
			class: $0,
			style: $1,
			role: 'progressbar',
			'aria-valuemin': 0,
			'aria-valuemax': 1,
			'aria-valuenow': indeterminate() ? undefined : progress(),
			...internalAttrs,
			...restProps,
			ontransitionend: event_handler
		}),
		[
			() => classMap({
				'mdc-linear-progress': true,
				'mdc-linear-progress--indeterminate': indeterminate(),
				'mdc-linear-progress--closed': closed(),
				'mdc-data-table__linear-progress': context === 'data-table',
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
		]
	);

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);

	$.next(2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);

	$.next(2);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);

	$.template_effect(
		($0, $1) => {
			$.set_style(div_2, $0);
			$.set_style(div_3, $1);
		},
		[
			() => Object.entries(bufferBarStyles).map(([name, value]) => `${name}: ${value};`).join(' '),
			() => Object.entries(primaryBarStyles).map(([name, value]) => `${name}: ${value};`).join(' ')
		]
	);

	$.append($$anchor, div);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}