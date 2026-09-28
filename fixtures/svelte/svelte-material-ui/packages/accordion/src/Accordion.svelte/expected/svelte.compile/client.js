import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'multiple',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Accordion($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether multiple panels can be open at once.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		multiple = $.prop($$props, 'multiple', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let panelAccessorSet = new Set();
	let withOpenDialog = $.state(false);

	setContext('SMUI:accordion:panel:mount', (accessor) => {
		if (!multiple() && accessor.open) {
			const currentOpen = Array.from(panelAccessorSet).find((accessor) => accessor.open);

			if (currentOpen) {
				currentOpen.setOpen(false);
			}
		}

		panelAccessorSet.add(accessor);
	});

	setContext('SMUI:accordion:panel:unmount', (accessor) => {
		// Nested check.
		if (!panelAccessorSet.has(accessor)) {
			return;
		}

		panelAccessorSet.delete(accessor);
	});

	function handlePanelActivate(event) {
		const { accessor } = event.detail;

		// Nested check.
		if (!panelAccessorSet.has(accessor)) {
			return;
		}

		if (!multiple() && !accessor.open) {
			const currentOpen = Array.from(panelAccessorSet).find((accessor) => accessor.open);

			if (currentOpen) {
				currentOpen.setOpen(false);
			}
		}

		accessor.setOpen(!accessor.open);
	}

	function handlePanelOpening(event) {
		const { accessor } = event.detail;

		// Nested check.
		if (!panelAccessorSet.has(accessor)) {
			return;
		}

		if (!multiple()) {
			const otherOpen = Array.from(panelAccessorSet).filter((checkAccessor) => checkAccessor !== accessor && checkAccessor.open);

			otherOpen.forEach((accessor) => accessor.setOpen(false));
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root();

	var event_handler = (e) => {
		handlePanelActivate(e);
		$$props.onSMUIAccordionPanelActivate?.(e);
	};

	var event_handler_1 = (e) => {
		handlePanelOpening(e);
		$$props.onSMUIAccordionPanelOpening?.(e);
	};

	var event_handler_2 = (e) => {
		$.set(withOpenDialog, true);
		$$props.onSMUIDialogOpeningcapture?.(e);
	};

	var event_handler_3 = (e) => {
		$.set(withOpenDialog, false);
		$$props.onSMUIDialogClosedcapture?.(e);
	};

	$.attribute_effect(
		div,
		($0) => ({
			class: $0,
			...restProps,
			onSMUIAccordionPanelActivate: event_handler,
			onSMUIAccordionPanelOpening: event_handler_1,
			onSMUIDialogOpeningcapture: event_handler_2,
			onSMUIDialogClosedcapture: event_handler_3
		}),
		[
			() => classMap({
				'smui-accordion': true,
				'smui-accordion--multiple': multiple(),
				'smui-accordion--with-open-dialog': $.get(withOpenDialog),
				[className()]: true
			})
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
	 */
	/**
	 * Whether multiple panels can be open at once.
	 */
	// Nested check.
	// Nested check.
	// Nested check.
}