import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';
import { ID } from '@appwrite.io/console';
import { debounce } from '$lib/helpers/debounce';
import { Badge } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<div class="disabled-area svelte-10wus3k"></div>`);
var root_1 = $.from_html(`<div></div>`);
var root_2 = $.from_html(`<div class="breakpoints svelte-10wus3k"></div>`);
var root_3 = $.from_html(`<div class="seekbar svelte-10wus3k"><div role="presentation"><!> <div class="progress svelte-10wus3k"></div> <div class="thumb-container svelte-10wus3k"><div class="badge svelte-10wus3k"><!></div> <div role="slider" class="thumb svelte-10wus3k" aria-valuemin="0"></div></div></div> <!></div>`);

export default function Seekbar($$anchor, $$props) {
	$.push($$props, true);

	let min = $.prop($$props, 'min', 3, 1),
		max = $.prop($$props, 'max', 3, 100),
		maxAllowed = $.prop($$props, 'maxAllowed', 19, max),
		value = $.prop($$props, 'value', 31, () => $.proxy(min())),
		breakPoints = $.prop($$props, 'breakPoints', 19, () => []),
		autoBreakpoints = $.prop($$props, 'autoBreakpoints', 3, true),
		breakpointCount = $.prop($$props, 'breakpointCount', 3, 7),
		snapToBreakpoints = $.prop($$props, 'snapToBreakpoints', 3, true),
		snapThreshold = $.prop($$props, 'snapThreshold', 3, 3),
		disabled = $.prop($$props, 'disabled', 3, false),
		id = $.prop($$props, 'id', 19, () => ID.unique()),
		extraBlockStart = $.prop($$props, 'extraBlockStart', 3, false);

	let isDragging = $.state(false);
	let trackRef = $.state(void 0);
	const range = $.derived(() => max() - min());
	const clampedValue = $.derived(() => Math.min(Math.max(value(), min()), maxAllowed()));
	const relativeValue = $.derived(() => $.get(clampedValue) - min());
	const percentage = $.derived(() => $.get(relativeValue) / max() * 100);
	const maxAllowedPercentage = $.derived(() => (maxAllowed() - min()) / $.get(range) * 100);

	const calculatedBreakpoints = $.derived(() => () => {
		if (!autoBreakpoints()) return breakPoints();

		const points = [];

		if (breakpointCount() === 1) {
			points.push(min());
		} else {
			points.push(min());

			if (breakpointCount() > 2) {
				const step = $.get(range) / (breakpointCount() - 1);

				for (let i = 1; i < breakpointCount() - 1; i++) {
					const rawValue = min() + i * step;
					let roundedValue;

					if ($.get(range) <= 10) {
						roundedValue = Math.round(rawValue);
					} else if ($.get(range) <= 100) {
						roundedValue = Math.round(rawValue / 5) * 5;
					} else if ($.get(range) <= 1000) {
						roundedValue = Math.round(rawValue / 10) * 10;
					} else {
						roundedValue = Math.round(rawValue / 25) * 25;
					}

					points.push(Math.max(min() + 1, Math.min(max() - 1, roundedValue)));
				}
			}

			points.push(max());
		}

		return points;
	});

	const exactBreakpoints = $.derived(() => () => {
		if (!autoBreakpoints()) return breakPoints();

		return $.get(calculatedBreakpoints)();
	});

	const debouncedOnChange = debounce(
		(newValue) => {
			$$props.onchange?.(Math.round(newValue));
		},
		150
	);

	function findClosestBreakpoint(value) {
		if (!snapToBreakpoints() || $.get(calculatedBreakpoints)().length === 0) return null;

		let closest = null;
		let closestDistance = Infinity;

		for (const breakpoint of $.get(calculatedBreakpoints)()) {
			const distance = Math.abs(value - breakpoint);
			const distancePercentage = distance / $.get(range) * 100;

			if (distancePercentage <= snapThreshold() && distance < closestDistance) {
				closest = breakpoint;
				closestDistance = distance;
			}
		}

		return closest;
	}

	function handleMouseDown(event) {
		if (disabled()) return;

		$.set(isDragging, true);
		updateValue(event);
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		event.preventDefault();
	}

	function handleMouseMove(event) {
		if (!$.get(isDragging)) return;

		updateValue(event);
	}

	function handleMouseUp() {
		$.set(isDragging, false);
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	function handleTrackClick(event) {
		if (disabled() || $.get(isDragging)) return;

		updateValue(event);
	}

	function updateValue(event) {
		if (!$.get(trackRef)) return;

		const rect = $.get(trackRef).getBoundingClientRect();
		const clickX = event.clientX - rect.left;
		const newPercentage = Math.max(0, Math.min(100, clickX / rect.width * 100));
		let newValue = min() + newPercentage / 100 * (max() - min());
		const snapPoint = findClosestBreakpoint(newValue);

		if (snapPoint !== null) {
			newValue = snapPoint;
		}

		const clampedNewValue = Math.max(min(), Math.min(newValue, maxAllowed()));
		const roundedValue = Math.round(clampedNewValue);

		if (roundedValue !== value()) {
			value(roundedValue);
			debouncedOnChange(value());
		}
	}

	onDestroy(() => {
		if ($.get(isDragging)) {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}
	});

	var div = root_3();
	var div_1 = $.child(div);
	let classes;
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var div_2 = root();
			let styles;

			$.template_effect(() => styles = $.set_style(div_2, '', styles, {
				left: `${$.get(maxAllowedPercentage) ?? ''}%`,
				width: `${100 - $.get(maxAllowedPercentage)}%`
			}));

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (maxAllowed() < max()) $$render(consequent);
		});
	}

	var div_3 = $.sibling(node, 2);
	let styles_1;
	var div_4 = $.sibling(div_3, 2);
	let styles_2;
	var div_5 = $.child(div_4);
	var node_1 = $.child(div_5);

	{
		let $0 = $.derived(() => Math.ceil($.get(clampedValue)).toString());

		Badge(node_1, {
			variant: 'secondary',
			size: 'xs',
			get content() {
				return $.get($0);
			}
		});
	}

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);

	$.reset(div_4);
	$.reset(div_1);
	$.bind_this(div_1, ($$value) => $.set(trackRef, $$value), () => $.get(trackRef));

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_7 = root_2();

			$.each(div_7, 21, () => $.get(exactBreakpoints)(), $.index, ($$anchor, breakPoint, index) => {
				const breakPercentage = $.derived(() => ($.get(breakPoint) - min()) / $.get(range) * 100);
				var div_8 = root_1();
				let classes_1;
				let styles_3;

				$.template_effect(
					($0) => {
						classes_1 = $.set_class(div_8, 1, 'breakpoint svelte-10wus3k', null, classes_1, { 'is-major': $0 });
						styles_3 = $.set_style(div_8, '', styles_3, { left: `${$.get(breakPercentage) ?? ''}%` });
					},
					[
						() => index === 0 || index === $.get(exactBreakpoints)().length - 1 || index === Math.floor($.get(exactBreakpoints)().length / 2)
					]
				);

				$.append($$anchor, div_8);
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		var d = $.derived(() => $.get(exactBreakpoints)().length > 0);

		$.if(node_2, ($$render) => {
			if ($.get(d)) $$render(consequent_1);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			classes = $.set_class(div_1, 1, 'track svelte-10wus3k', null, classes, { 'extra-space': extraBlockStart() });
			styles_1 = $.set_style(div_3, '', styles_1, { '--progress-width': `${$.get(percentage) ?? ''}%` });
			styles_2 = $.set_style(div_4, '', styles_2, { left: `${$.get(percentage) ?? ''}%` });
			$.set_attribute(div_6, 'id', id());
			$.set_attribute(div_6, 'tabindex', disabled() ? -1 : 0);
			$.set_attribute(div_6, 'aria-valuemax', maxAllowed());
			$.set_attribute(div_6, 'aria-valuenow', $0);
		},
		[() => Math.ceil($.get(clampedValue))]
	);

	$.delegated('click', div_1, handleTrackClick);
	$.delegated('mousedown', div_6, handleMouseDown);
	$.event('mouseenter', div_6, () => !disabled());
	$.event('mouseleave', div_6, () => !$.get(isDragging));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click', 'mousedown']);