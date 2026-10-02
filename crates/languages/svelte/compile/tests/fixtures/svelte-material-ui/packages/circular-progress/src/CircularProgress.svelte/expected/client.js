import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { classMap, useActions } from '@smui/common/internal';
import { MDCCircularProgressFoundation } from './mdc';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'use',
	'class',
	'indeterminate',
	'closed',
	'progress',
	'fourColor'
]);

var root = $.from_html(`<div><div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-left"><svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"></circle></svg></div> <div class="mdc-circular-progress__gap-patch"><svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="3.2"></circle></svg></div> <div class="mdc-circular-progress__circle-clipper mdc-circular-progress__circle-right"><svg class="mdc-circular-progress__indeterminate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke-dasharray="113.097" stroke-dashoffset="56.549" stroke-width="4"></circle></svg></div></div>`);
var root_1 = $.from_html(`<div><div class="mdc-circular-progress__determinate-container"><svg class="mdc-circular-progress__determinate-circle-graphic" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle class="mdc-circular-progress__determinate-track" cx="24" cy="24" r="18" stroke-width="4"></circle><circle></circle></svg></div> <div class="mdc-circular-progress__indeterminate-container"></div></div>`);

export default function CircularProgress($$anchor, $$props) {
	$.push($$props, true);

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	/**
	 * A space separated list of CSS classes.
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
	 * Show the four color loop animation.
	 */
	let use = $.prop($$props, 'use', 19, () => []),
		className = $.prop($$props, 'class', 3, ''),
		indeterminate = $.prop($$props, 'indeterminate', 3, false),
		closed = $.prop($$props, 'closed', 3, false),
		progress = $.prop($$props, 'progress', 3, 0),
		fourColor = $.prop($$props, 'fourColor', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	let element;
	let instance = $.state(void 0);
	let internalClasses = $.proxy({});
	let internalAttrs = $.proxy({});
	let determinateCircleAttrs = $.proxy({});
	let determinateCircle;

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
			new MDCCircularProgressFoundation({
				addClass,
				getDeterminateCircleAttribute: getDeterminateCircleAttr,
				hasClass,
				removeClass,
				removeAttribute: removeAttr,
				setAttribute: addAttr,
				setDeterminateCircleAttribute: addDeterminateCircleAttr
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

	function getDeterminateCircleAttr(name) {
		return name in determinateCircleAttrs
			? determinateCircleAttrs[name] ?? null
			: determinateCircle.getAttribute(name);
	}

	function addDeterminateCircleAttr(name, value) {
		if (determinateCircleAttrs[name] !== value) {
			determinateCircleAttrs[name] = value;
		}
	}

	function getElement() {
		return element;
	}

	var $$exports = { getElement };
	var div = root_1();

	$.attribute_effect(
		div,
		($0) => ({
			class: $0,
			role: 'progressbar',
			'aria-valuemin': 0,
			'aria-valuemax': 1,
			'aria-valuenow': indeterminate() ? undefined : progress(),
			...internalAttrs,
			...restProps
		}),
		[
			() => classMap({
				'mdc-circular-progress': true,
				'mdc-circular-progress--indeterminate': indeterminate(),
				'mdc-circular-progress--closed': closed(),
				...internalClasses,
				[className()]: true
			})
		]
	);

	var div_1 = $.child(div);
	var svg = $.child(div_1);
	var circle = $.sibling($.child(svg));

	$.attribute_effect(circle, () => ({
		class: 'mdc-circular-progress__determinate-circle',
		cx: '24',
		cy: '24',
		r: '18',
		'stroke-dasharray': '113.097',
		'stroke-dashoffset': '113.097',
		'stroke-width': '4',
		...determinateCircleAttrs
	}));

	$.bind_this(circle, ($$value) => determinateCircle = $$value, () => determinateCircle);
	$.reset(svg);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);

	$.each(div_2, 21, () => fourColor() ? [1, 2, 3, 4] : [1], $.index, ($$anchor, color) => {
		var div_3 = root();

		$.template_effect(($0) => $.set_class(div_3, 1, $0), [
			() => $.clsx(classMap({
				'mdc-circular-progress__spinner-layer': true,
				['mdc-circular-progress__color-' + $.get(color)]: fourColor(),
				[className()]: true
			}))
		]);

		$.append($$anchor, div_3);
	});

	$.reset(div_2);
	$.reset(div);
	$.bind_this(div, ($$value) => element = $$value, () => element);
	$.action(div, ($$node, $$action_arg) => useActions?.($$node, $$action_arg), use);
	$.append($$anchor, div);

	return $.pop($$exports);
}