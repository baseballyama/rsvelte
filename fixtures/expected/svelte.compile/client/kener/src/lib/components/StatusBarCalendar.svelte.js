import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { mode } from "mode-watcher";
import { page } from "$app/state";
import { GetStatusSummary, ParseLatency } from "$lib/clientTools";
import MonitorDayDetail from "$lib/components/MonitorDayDetail.svelte";
import { t } from "$lib/stores/i18n";
import { formatDate } from "$lib/stores/datetime";
import trackEvent from "$lib/beacon";

var root = $.from_html(`<span class="text-muted-foreground ml-1">|</span> <span class="ml-1"> </span>`, 1);
var root_1 = $.from_html(`<div class="bg-popover text-popver-foreground pointer-events-none absolute z-20 w-max -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap"><span> </span> <span class="text-muted-foreground">@</span> <!></div>`);
var root_2 = $.from_html(`<div><div class="overflow-hidden"><canvas class="cursor-pointer svelte-1rbx4p5"></canvas></div> <!></div> <!>`, 1);

export default function StatusBarCalendar($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let barHeight = $.prop($$props, 'barHeight', 3, 40),
		radius = $.prop($$props, 'radius', 3, 8),
		className = $.prop($$props, 'class', 3, ""),
		disableClick = $.prop($$props, 'disableClick', 3, false);

	// Canvas state
	let canvas = $.state(null);

	let container = $.state(null);
	let tooltipEl = $.state(null);
	let canvasWidth = $.state(0);
	let hoveredBar = $.state(null);
	let mounted = $.state(false);
	let dpr = $.state(1);
	let resizeObserver = null;

	// Calculate clamped tooltip position to prevent overflow
	let tooltipStyle = $.derived(() => {
		if (!$.get(hoveredBar) || !$.get(tooltipEl)) {
			return `left: 0px; bottom: ${barHeight() + 16}px; opacity: 0;`;
		}

		const tooltipWidth = $.get(tooltipEl).offsetWidth;
		const halfTooltip = tooltipWidth / 2;
		const padding = 4; // Small padding from edges

		// Clamp position so tooltip stays within container
		let left = $.get(hoveredBar).x;

		const minLeft = halfTooltip + padding;
		const maxLeft = $.get(canvasWidth) - halfTooltip - padding;

		if (left < minLeft) {
			left = minLeft;
		} else if (left > maxLeft) {
			left = maxLeft;
		}

		return `left: ${left}px; bottom: ${barHeight() + 16}px;`;
	});

	// Dialog state for day detail
	let dialogOpen = $.state(false);

	let selectedDay = $.state(null);

	// Colors from page data
	const colorUp = $.derived(() => page.data.siteStatusColors?.UP || "#22c55e");

	const colorDown = $.derived(() => page.data.siteStatusColors?.DOWN || "#ef4444");
	const colorDegraded = $.derived(() => page.data.siteStatusColors?.DEGRADED || "#eab308");
	const colorMaintenance = $.derived(() => page.data.siteStatusColors?.MAINTENANCE || "#3b82f6");
	const gap = 0;

	// Track hovered index separately for efficient redraw
	let hoveredIndex = $.state(null);

	function calculateBarWidth() {
		if (!$$props.data || $$props.data.length === 0 || $.get(canvasWidth) === 0) return 0;

		const totalGaps = ($$props.data.length - 1) * gap;

		return Math.max(1, ($.get(canvasWidth) - totalGaps) / $$props.data.length);
	}

	// Helper to draw a rounded rect path (only rounds specified corners)
	function roundedRectPath(ctx, x, y, width, height, r, roundLeft, roundRight) {
		const tl = roundLeft ? r : 0;
		const bl = roundLeft ? r : 0;
		const tr = roundRight ? r : 0;
		const br = roundRight ? r : 0;

		ctx.beginPath();
		ctx.moveTo(x + tl, y);
		ctx.lineTo(x + width - tr, y);

		if (tr) ctx.arcTo(x + width, y, x + width, y + tr, tr); else ctx.lineTo(x + width, y);

		ctx.lineTo(x + width, y + height - br);

		if (br) ctx.arcTo(x + width, y + height, x + width - br, y + height, br); else ctx.lineTo(x + width, y + height);

		ctx.lineTo(x + bl, y + height);

		if (bl) ctx.arcTo(x, y + height, x, y + height - bl, bl); else ctx.lineTo(x, y + height);

		ctx.lineTo(x, y + tl);

		if (tl) ctx.arcTo(x, y, x + tl, y, tl); else ctx.lineTo(x, y);

		ctx.closePath();
	}

	function drawBars(highlightIndex = null) {
		if (!$.get(canvas) || $.get(canvasWidth) === 0 || !$.get(mounted) || !$$props.data || $$props.data.length === 0) return;

		const ctx = $.get(canvas).getContext("2d");

		if (!ctx) return;

		// Add padding for scale effect
		const padding = 4;

		const totalHeight = barHeight() + padding * 2;

		// Scale canvas for high-DPI displays
		const scaledWidth = Math.floor($.get(canvasWidth) * $.get(dpr));

		const scaledHeight = Math.floor(totalHeight * $.get(dpr));

		$.get(canvas).width = scaledWidth;
		$.get(canvas).height = scaledHeight;
		ctx.scale($.get(dpr), $.get(dpr));

		const barWidth = calculateBarWidth();
		const noDataColor = mode.current === "dark" ? "#27272a" : "#e4e4e7";
		const roundedGap = Math.round(gap);

		// Clear canvas
		ctx.clearRect(0, 0, $.get(canvasWidth), totalHeight);

		// Draw each bar
		for (let i = 0; i < $$props.data.length; i++) {
			const x = Math.round(i * (barWidth + gap));
			const nextX = Math.round((i + 1) * (barWidth + gap));
			const roundedBarWidth = Math.max(0, nextX - x - roundedGap);
			const barItem = $$props.data[i];
			const total = barItem.countOfUp + barItem.countOfDown + barItem.countOfDegraded + barItem.countOfMaintenance;

			// Calculate scale and opacity based on hover
			let scale = 1;

			let opacity = 1;

			if (highlightIndex !== null) {
				if (i === highlightIndex) {
					scale = 1.15;
					opacity = 1;
				} else if (i === highlightIndex - 1 || i === highlightIndex + 1) {
					scale = 1.08;
					opacity = 0.9;
				} else {
					scale = 1;
					opacity = 0.5;
				}
			}

			ctx.globalAlpha = opacity;

			// Calculate scaled dimensions
			const scaledBarHeight = barHeight() * scale;

			const yOffset = padding + (barHeight() - scaledBarHeight) / 2;

			// Determine if this bar needs rounded corners
			const isFirst = i === 0;

			const isLast = i === $$props.data.length - 1;
			const cornerRadius = radius() * scale;

			// Set up clipping path for rounded corners on first/last bars
			ctx.save();

			if (isFirst || isLast) {
				roundedRectPath(ctx, x, yOffset, roundedBarWidth, scaledBarHeight, cornerRadius, isFirst, isLast);
				ctx.clip();
			}

			if (total === 0) {
				// No data - draw gray bar
				ctx.fillStyle = noDataColor;

				ctx.fillRect(x, yOffset, roundedBarWidth, scaledBarHeight);
				ctx.restore();

				continue;
			}

			// Stacked bar: draw from bottom to top
			// Order: maintenance (bottom) -> down -> degraded -> up (top)
			let currentY = yOffset + scaledBarHeight;

			const minHeightPercent = 0.05; // 5% minimum height for visibility

			// Helper to calculate segment height with minimum 5% visibility
			const getSegmentHeight = (count) => {
				if (count === 0) return 0;

				return Math.max(minHeightPercent * scaledBarHeight, Math.round(count / total * scaledBarHeight));
			};

			// Calculate heights in reverse priority order (UP gets remaining)
			const maintenanceHeight = getSegmentHeight(barItem.countOfMaintenance);

			const downHeight = getSegmentHeight(barItem.countOfDown);
			const degradedHeight = getSegmentHeight(barItem.countOfDegraded);

			// Up fills the remaining space (back-calculated)
			const usedHeight = maintenanceHeight + downHeight + degradedHeight;

			const upHeight = barItem.countOfUp > 0 ? Math.max(0, scaledBarHeight - usedHeight) : 0;

			// Draw maintenance (blue) at bottom
			if (maintenanceHeight > 0) {
				currentY -= maintenanceHeight;
				ctx.fillStyle = $.get(colorMaintenance);
				ctx.fillRect(x, currentY, roundedBarWidth, maintenanceHeight);
			}

			// Draw down (red)
			if (downHeight > 0) {
				currentY -= downHeight;
				ctx.fillStyle = $.get(colorDown);
				ctx.fillRect(x, currentY, roundedBarWidth, downHeight);
			}

			// Draw degraded (yellow)
			if (degradedHeight > 0) {
				currentY -= degradedHeight;
				ctx.fillStyle = $.get(colorDegraded);
				ctx.fillRect(x, currentY, roundedBarWidth, degradedHeight);
			}

			// Draw up (green) at top - fill remaining height
			if (upHeight > 0) {
				ctx.fillStyle = $.get(colorUp);
				ctx.fillRect(x, yOffset, roundedBarWidth, upHeight);
			}

			ctx.restore();
		}

		// Reset global alpha
		ctx.globalAlpha = 1;
	}

	function handleMouseMove(event) {
		if (!$.get(canvas) || !$$props.data || $$props.data.length === 0 || $.get(canvasWidth) === 0) return;

		const rect = $.get(canvas).getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const barWidth = calculateBarWidth();
		const totalBarWidth = barWidth + gap;

		// Find which bar the mouse is over
		let foundIndex = -1;

		for (let i = 0; i < $$props.data.length; i++) {
			const barStart = Math.round(i * totalBarWidth);
			const barEnd = Math.round((i + 1) * totalBarWidth) - Math.round(gap);

			if (mouseX >= barStart && mouseX < barEnd) {
				foundIndex = i;

				break;
			}
		}

		if (foundIndex >= 0) {
			const barX = Math.round(foundIndex * totalBarWidth) + Math.round(barWidth) / 2;

			$.set(hoveredBar, { index: foundIndex, x: barX, data: $$props.data[foundIndex] }, true);

			// Only redraw if hovered index changed
			if ($.get(hoveredIndex) !== foundIndex) {
				$.set(hoveredIndex, foundIndex, true);
				drawBars(foundIndex);
			}
		} else {
			$.set(hoveredBar, null);

			if ($.get(hoveredIndex) !== null) {
				$.set(hoveredIndex, null);
				drawBars(null);
			}
		}
	}

	function handleMouseLeave() {
		$.set(hoveredBar, null);

		if ($.get(hoveredIndex) !== null) {
			$.set(hoveredIndex, null);
			drawBars(null);
		}
	}

	function handleBarClick(event) {
		if (disableClick() || !$.get(hoveredBar) || !$$props.data) return;

		const barData = $$props.data[$.get(hoveredBar).index];
		const total = barData.countOfUp + barData.countOfDown + barData.countOfDegraded + barData.countOfMaintenance;

		// Determine status for the day
		let status = "NO_DATA";

		if (total > 0) {
			if (barData.countOfDown > 0) status = "DOWN"; else if (barData.countOfDegraded > 0) status = "DEGRADED"; else if (barData.countOfMaintenance > 0) status = "MAINTENANCE"; else status = "UP";
		}

		trackEvent("status_calendar_day_opened", {
			monitorTag: $$props.monitorTag,
			status,
			timestamp: barData.ts
		});

		$.set(selectedDay, { timestamp: barData.ts, status }, true);
		$.set(dialogOpen, true);
	}

	function handleDialogClose() {
		$.set(selectedDay, null);
	}

	function getStatusColor(item) {
		const total = item.countOfUp + item.countOfDown + item.countOfDegraded + item.countOfMaintenance;

		if (total === 0) return "text-muted-foreground";
		if (item.countOfMaintenance > 0) return "text-maintenance";
		if (item.countOfDown > 0) return "text-down";
		if (item.countOfDegraded > 0) return "text-degraded";

		return "text-up";
	}

	onMount(() => {
		$.set(mounted, true);
		$.set(dpr, window.devicePixelRatio || 1, true);

		return () => {
			resizeObserver?.disconnect();
		};
	});

	// Set up resize observer when container becomes available
	$.user_effect(() => {
		if ($.get(container) && !resizeObserver) {
			$.set(canvasWidth, $.get(container).clientWidth, true);

			resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					$.set(canvasWidth, entry.contentRect.width, true);
				}
			});

			resizeObserver.observe($.get(container));
		}
	});

	// Redraw when data, width, or theme changes
	$.user_effect(() => {
		const _width = $.get(canvasWidth);
		const _data = $$props.data;
		const _mode = mode.current;

		if (_width > 0 && _data && _data.length > 0 && $.get(mounted)) {
			drawBars($.get(hoveredIndex));
		}
	});

	var fragment = root_2();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var canvas_1 = $.child(div_1);

	$.bind_this(canvas_1, ($$value) => $.set(canvas, $$value), () => $.get(canvas));
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();
			var span = $.child(div_2);
			var text = $.only_child(span, true);
			var text_1 = $.sibling(span, 3);
			var node_1 = $.sibling(text_1);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root();
					var span_1 = $.sibling($.first_child(fragment_1), 2);
					var text_2 = $.only_child(span_1, true);

					$.template_effect(($0) => $.set_text(text_2, $0), [() => ParseLatency($.get(hoveredBar).data.avgLatency)]);
					$.append($$anchor, fragment_1);
				};

				$.if(node_1, ($$render) => {
					if ($.get(hoveredBar).data.avgLatency > 0) $$render(consequent);
				});
			}

			$.reset(div_2);
			$.bind_this(div_2, ($$value) => $.set(tooltipEl, $$value), () => $.get(tooltipEl));

			$.template_effect(
				($0, $1, $2) => {
					$.set_style(div_2, $.get(tooltipStyle));
					$.set_class(span, 1, $0);
					$.set_text(text, $1);
					$.set_text(text_1, ` ${$2 ?? ''} `);
				},
				[
					() => $.clsx(getStatusColor($.get(hoveredBar).data)),
					() => $t()(GetStatusSummary($.get(hoveredBar).data)),
					() => $formatDate()($.get(hoveredBar).data.ts, page.data.dateAndTimeFormat.dateOnly)
				]
			);

			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if ($.get(hoveredBar)) $$render(consequent_1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(container, $$value), () => $.get(container));

	var node_2 = $.sibling(div, 2);

	MonitorDayDetail(node_2, {
		get monitorTag() {
			return $$props.monitorTag;
		},

		get selectedDay() {
			return $.get(selectedDay);
		},

		get open() {
			return $.get(dialogOpen);
		},

		set open($$value) {
			$.set(dialogOpen, $$value, true);
		}
	});

	$.template_effect(() => {
		$.set_class(div, 1, `relative w-full ${className() ?? ''}`);
		$.set_style(div_1, `border-radius: ${radius() ?? ''}px;`);
		$.set_style(canvas_1, `width: 100%; height: ${barHeight() + 8}px;`);
		$.set_attribute(canvas_1, 'aria-label', `Status calendar showing ${$$props.data.length ?? ''}-day uptime data`);
	});

	$.delegated('mousemove', canvas_1, handleMouseMove);
	$.event('mouseleave', canvas_1, handleMouseLeave);
	$.delegated('click', canvas_1, handleBarClick);
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}

$.delegate(['mousemove', 'click']);