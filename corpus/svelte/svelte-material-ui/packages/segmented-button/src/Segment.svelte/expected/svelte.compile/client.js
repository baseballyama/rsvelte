import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, getContext } from 'svelte';
import { classMap, useActions, dispatch } from '@smui/common/internal';
import Ripple from '@smui/ripple';
import { MDCSegmentedButtonSegmentFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'style',
	'segment',
	'ripple',
	'touch',
	'selected',
	'children'
]);

var root = $.from_html(`<div class="mdc-segmented-button__ripple"></div>`);
var root_1 = $.from_html(`<div class="mdc-segmented-button__segment__touch"></div>`);
var root_2 = $.from_html(`<button><!><!><!></button>`);

export default function Segment($$anchor, $$props) {
	$.push($$props, true);

	const $initialSelectedStore = () => $.store_get(initialSelectedStore, '$initialSelectedStore', $$stores);
	const $singleSelect = () => $.store_get(singleSelect, '$singleSelect', $$stores);
	const $index = () => $.store_get(index, '$index', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
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
	 * A list of CSS styles.
	 */
	/**
	 * The segment object this segment is for.
	 */
	/**
	 * Whether to show a ripple animation.
	 */
	/**
	 * Whether to use touch styling
	 */
	/**
	 * Whether this segment is selected.
	 *
	 * You don't need to set this unless you are manually handling selection.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		style = $.prop($$props, 'style', 3, ''),
		ripple = $.prop($$props, 'ripple', 3, true),
		touch = $.prop($$props, 'touch', 3, false),
		selected = $.prop($$props, 'selected', 15, uninitializedValue),
		restProps = $.rest_props($$props, rest_excludes);

	const initialSelectedStore = getContext('SMUI:segmented-button:segment:initialSelected');

	// Some trickery to detect uninitialized values but also have the right types.
	let manualSelection = !isUninitializedValue(selected());

	if (isUninitializedValue(selected())) {
		selected($initialSelectedStore());
	}

	// Done with the trickery.
	let element;

	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalStyles = $.proxy({});
	let internalAttrs = $.proxy({});
	const singleSelect = getContext('SMUI:segmented-button:singleSelect');
	const index = getContext('SMUI:segmented-button:segment:index');

	$.user_effect(() => {
		if ($.get(instance) && $.get(instance).isSelected() && !selected()) {
			$.get(instance).setUnselected();
		}
	});

	$.user_effect(() => {
		if ($.get(instance) && !$.get(instance).isSelected() && selected()) {
			$.get(instance).setSelected();
		}
	});

	const SMUISegmentedButtonSegmentMount = getContext('SMUI:segmented-button:segment:mount');
	const SMUISegmentedButtonSegmentUnmount = getContext('SMUI:segmented-button:segment:unmount');

	onMount(() => {
		$.set(
			instance,
			new MDCSegmentedButtonSegmentFoundation({
				isSingleSelect: () => {
					return $singleSelect();
				},
				getAttr,
				setAttr: addAttr,
				addClass,
				removeClass,
				hasClass,
				notifySelectedChange: (value) => {
					selected(value);

					dispatch(getElement(), 'selected', {
						index: $index(),
						selected: selected(),
						segmentId: $$props.segment
					});
				},

				getRootBoundingClientRect: () => {
					return getElement().getBoundingClientRect();
				}
			}),
			true
		);

		const accessor = {
			segmentId: $$props.segment,
			get selected() {
				return selected();
			},

			set selected(value) {
				if (selected() !== value) {
					selected(value);
				}
			}
		};

		SMUISegmentedButtonSegmentMount && SMUISegmentedButtonSegmentMount(accessor);
		$.get(instance).init();

		return () => {
			SMUISegmentedButtonSegmentUnmount && SMUISegmentedButtonSegmentUnmount(accessor);
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

	function getAttr(name) {
		return name in internalAttrs
			? internalAttrs[name] ?? null
			: getElement().getAttribute(name);
	}

	function addAttr(name, value) {
		if (internalAttrs[name] !== value) {
			internalAttrs[name] = value;
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

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var button = root_2();

	var event_handler = (e) => {
		$$props.onclick?.(e);

		if (!e.defaultPrevented && $.get(instance) && !manualSelection) {
			$.get(instance).handleClick();
		}
	};

	$.attribute_effect(
		button,
		($0, $1) => ({
			class: $0,
			style: $1,
			role: singleSelect ? 'radio' : undefined,
			'aria-pressed': !singleSelect ? selected() ? 'true' : 'false' : undefined,
			'aria-checked': singleSelect ? selected() ? 'true' : 'false' : undefined,
			...internalAttrs,
			...restProps,
			onclick: event_handler
		}),
		[
			() => classMap({
				'mdc-segmented-button__segment': true,
				'mdc-segmented-button__segment--touch': touch(),
				'mdc-segmented-button__segment--selected': selected(),
				...internalClasses,
				[className()]: true
			}),
			() => Object.entries(internalStyles).map(([name, value]) => `${name}: ${value};`).concat([style()]).join(' ')
		]
	);

	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var div = root();

			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (ripple()) $$render(consequent);
		});
	}

	var node_1 = $.sibling(node);

	$.snippet(node_1, () => $$props.children ?? $.noop);

	var node_2 = $.sibling(node_1);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root_1();

			$.append($$anchor, div_1);
		};

		$.if(node_2, ($$render) => {
			if (touch()) $$render(consequent_1);
		});
	}

	$.reset(button);
	$.bind_this(button, ($$value) => element = $$value, () => element);

	$.action(button, ($$node, $$action_arg) => Ripple?.($$node, $$action_arg), () => ({
		ripple: ripple(),
		unbounded: false,
		addClass,
		removeClass,
		addStyle
	}));

	$.action(button, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, button);

	var $$pop = $.pop($$exports);

	$$cleanup();

	return $$pop;
}