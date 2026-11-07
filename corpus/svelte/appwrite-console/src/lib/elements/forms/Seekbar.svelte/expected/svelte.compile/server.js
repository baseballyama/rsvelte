import * as $ from 'svelte/internal/server';
import { onDestroy } from 'svelte';
import { ID } from '@appwrite.io/console';
import { debounce } from '$lib/helpers/debounce';
import { Badge } from '@appwrite.io/pink-svelte';

export default function Seekbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			min = 1,
			max = 100,
			maxAllowed = max,
			value = min,
			breakPoints = [],
			autoBreakpoints = true,
			breakpointCount = 7,
			snapToBreakpoints = true,
			snapThreshold = 3,
			disabled = false,
			id = ID.unique(),
			extraBlockStart = false,
			onchange
		} = $$props;

		let isDragging = false;
		let trackRef = void 0;
		const range = $.derived(() => max - min);
		const clampedValue = $.derived(() => Math.min(Math.max(value, min), maxAllowed));
		const relativeValue = $.derived(() => clampedValue() - min);
		const percentage = $.derived(() => relativeValue() / max * 100);
		const maxAllowedPercentage = $.derived(() => (maxAllowed - min) / range() * 100);

		const calculatedBreakpoints = $.derived(() => () => {
			if (!autoBreakpoints) return breakPoints;

			const points = [];

			if (breakpointCount === 1) {
				points.push(min);
			} else {
				points.push(min);

				if (breakpointCount > 2) {
					const step = range() / (breakpointCount - 1);

					for (let i = 1; i < breakpointCount - 1; i++) {
						const rawValue = min + i * step;
						let roundedValue;

						if (range() <= 10) {
							roundedValue = Math.round(rawValue);
						} else if (range() <= 100) {
							roundedValue = Math.round(rawValue / 5) * 5;
						} else if (range() <= 1000) {
							roundedValue = Math.round(rawValue / 10) * 10;
						} else {
							roundedValue = Math.round(rawValue / 25) * 25;
						}

						points.push(Math.max(min + 1, Math.min(max - 1, roundedValue)));
					}
				}

				points.push(max);
			}

			return points;
		});

		const exactBreakpoints = $.derived(() => () => {
			if (!autoBreakpoints) return breakPoints;

			return calculatedBreakpoints()();
		});

		const debouncedOnChange = debounce(
			(newValue) => {
				onchange?.(Math.round(newValue));
			},
			150
		);

		function findClosestBreakpoint(value) {
			if (!snapToBreakpoints || calculatedBreakpoints()().length === 0) return null;

			let closest = null;
			let closestDistance = Infinity;

			for (const breakpoint of calculatedBreakpoints()()) {
				const distance = Math.abs(value - breakpoint);
				const distancePercentage = distance / range() * 100;

				if (distancePercentage <= snapThreshold && distance < closestDistance) {
					closest = breakpoint;
					closestDistance = distance;
				}
			}

			return closest;
		}

		function handleMouseDown(event) {
			if (disabled) return;

			isDragging = true;
			updateValue(event);
			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);
			event.preventDefault();
		}

		function handleMouseMove(event) {
			if (!isDragging) return;

			updateValue(event);
		}

		function handleMouseUp() {
			isDragging = false;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		}

		function handleTrackClick(event) {
			if (disabled || isDragging) return;

			updateValue(event);
		}

		function updateValue(event) {
			if (!trackRef) return;

			const rect = trackRef.getBoundingClientRect();
			const clickX = event.clientX - rect.left;
			const newPercentage = Math.max(0, Math.min(100, clickX / rect.width * 100));
			let newValue = min + newPercentage / 100 * (max - min);
			const snapPoint = findClosestBreakpoint(newValue);

			if (snapPoint !== null) {
				newValue = snapPoint;
			}

			const clampedNewValue = Math.max(min, Math.min(newValue, maxAllowed));
			const roundedValue = Math.round(clampedNewValue);

			if (roundedValue !== value) {
				value = roundedValue;
				debouncedOnChange(value);
			}
		}

		onDestroy(() => {
			if (isDragging) {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			}
		});

		$$renderer.push(`<div class="seekbar svelte-10wus3k"><div${$.attr_class('track svelte-10wus3k', void 0, { 'extra-space': extraBlockStart })} role="presentation">`);

		if (maxAllowed < max) {
			$$renderer.push(`<!--[0--><div class="disabled-area svelte-10wus3k"${$.attr_style('', {
				left: `${$.stringify(maxAllowedPercentage())}%`,
				width: `${$.stringify(100 - maxAllowedPercentage())}%`
			})}></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="progress svelte-10wus3k"${$.attr_style('', { '--progress-width': `${$.stringify(percentage())}%` })}></div> <div class="thumb-container svelte-10wus3k"${$.attr_style('', { left: `${$.stringify(percentage())}%` })}><div class="badge svelte-10wus3k">`);

		Badge($$renderer, {
			variant: 'secondary',
			size: 'xs',
			content: Math.ceil(clampedValue()).toString()
		});

		$$renderer.push(`<!----></div> <div${$.attr('id', id)} role="slider" class="thumb svelte-10wus3k"${$.attr('tabindex', disabled ? -1 : 0)} aria-valuemin="0"${$.attr('aria-valuemax', maxAllowed)}${$.attr('aria-valuenow', Math.ceil(clampedValue()))}></div></div></div> `);

		if (exactBreakpoints()().length > 0) {
			$$renderer.push(`<!--[0--><div class="breakpoints svelte-10wus3k"><!--[-->`);

			const each_array = $.ensure_array_like(exactBreakpoints()());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let breakPoint = each_array[index];
				const breakPercentage = (breakPoint - min) / range() * 100;

				$$renderer.push(`<div${$.attr_class('breakpoint svelte-10wus3k', void 0, {
					'is-major': index === 0 || index === exactBreakpoints()().length - 1 || index === Math.floor(exactBreakpoints()().length / 2)
				})}${$.attr_style('', { left: `${$.stringify(breakPercentage)}%` })}></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}