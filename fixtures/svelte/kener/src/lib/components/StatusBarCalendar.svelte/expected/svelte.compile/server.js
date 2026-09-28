import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { mode } from "mode-watcher";
import { page } from "$app/state";
import { GetStatusSummary, ParseLatency } from "$lib/clientTools";
import MonitorDayDetail from "$lib/components/MonitorDayDetail.svelte";
import { t } from "$lib/stores/i18n";
import { formatDate } from "$lib/stores/datetime";
import trackEvent from "$lib/beacon";

export default function StatusBarCalendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			data,
			monitorTag,
			barHeight = 40,
			radius = 8,
			class: className = "",
			disableClick = false
		} = $$props;

		// Canvas state
		let canvas = null;

		let container = null;
		let tooltipEl = null;
		let canvasWidth = 0;
		let hoveredBar = null;
		let mounted = false;
		let dpr = 1;
		let resizeObserver = null;

		// Calculate clamped tooltip position to prevent overflow
		let tooltipStyle = $.derived(() => {
			if (!hoveredBar || !tooltipEl) {
				return `left: 0px; bottom: ${barHeight + 16}px; opacity: 0;`;
			}

			const tooltipWidth = tooltipEl.offsetWidth;
			const halfTooltip = tooltipWidth / 2;
			const padding = 4; // Small padding from edges

			// Clamp position so tooltip stays within container
			let left = hoveredBar.x;

			const minLeft = halfTooltip + padding;
			const maxLeft = canvasWidth - halfTooltip - padding;

			if (left < minLeft) {
				left = minLeft;
			} else if (left > maxLeft) {
				left = maxLeft;
			}

			return `left: ${left}px; bottom: ${barHeight + 16}px;`;
		});

		// Dialog state for day detail
		let dialogOpen = false;

		let selectedDay = null;

		// Colors from page data
		const colorUp = $.derived(() => page.data.siteStatusColors?.UP || "#22c55e");

		const colorDown = $.derived(() => page.data.siteStatusColors?.DOWN || "#ef4444");
		const colorDegraded = $.derived(() => page.data.siteStatusColors?.DEGRADED || "#eab308");
		const colorMaintenance = $.derived(() => page.data.siteStatusColors?.MAINTENANCE || "#3b82f6");
		const gap = 0;

		// Track hovered index separately for efficient redraw
		let hoveredIndex = null;

		function calculateBarWidth() {
			if (!data || data.length === 0 || canvasWidth === 0) return 0;

			const totalGaps = (data.length - 1) * gap;

			return Math.max(1, (canvasWidth - totalGaps) / data.length);
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
			if (!canvas || canvasWidth === 0 || !mounted || !data || data.length === 0) return;

			const ctx = canvas.getContext("2d");

			if (!ctx) return;

			// Add padding for scale effect
			const padding = 4;

			const totalHeight = barHeight + padding * 2;

			// Scale canvas for high-DPI displays
			const scaledWidth = Math.floor(canvasWidth * dpr);

			const scaledHeight = Math.floor(totalHeight * dpr);

			canvas.width = scaledWidth;
			canvas.height = scaledHeight;
			ctx.scale(dpr, dpr);

			const barWidth = calculateBarWidth();
			const noDataColor = mode.current === "dark" ? "#27272a" : "#e4e4e7";
			const roundedGap = Math.round(gap);

			// Clear canvas
			ctx.clearRect(0, 0, canvasWidth, totalHeight);

			// Draw each bar
			for (let i = 0; i < data.length; i++) {
				const x = Math.round(i * (barWidth + gap));
				const nextX = Math.round((i + 1) * (barWidth + gap));
				const roundedBarWidth = Math.max(0, nextX - x - roundedGap);
				const barItem = data[i];
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
				const scaledBarHeight = barHeight * scale;

				const yOffset = padding + (barHeight - scaledBarHeight) / 2;

				// Determine if this bar needs rounded corners
				const isFirst = i === 0;

				const isLast = i === data.length - 1;
				const cornerRadius = radius * scale;

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
					ctx.fillStyle = colorMaintenance();
					ctx.fillRect(x, currentY, roundedBarWidth, maintenanceHeight);
				}

				// Draw down (red)
				if (downHeight > 0) {
					currentY -= downHeight;
					ctx.fillStyle = colorDown();
					ctx.fillRect(x, currentY, roundedBarWidth, downHeight);
				}

				// Draw degraded (yellow)
				if (degradedHeight > 0) {
					currentY -= degradedHeight;
					ctx.fillStyle = colorDegraded();
					ctx.fillRect(x, currentY, roundedBarWidth, degradedHeight);
				}

				// Draw up (green) at top - fill remaining height
				if (upHeight > 0) {
					ctx.fillStyle = colorUp();
					ctx.fillRect(x, yOffset, roundedBarWidth, upHeight);
				}

				ctx.restore();
			}

			// Reset global alpha
			ctx.globalAlpha = 1;
		}

		function handleMouseMove(event) {
			if (!canvas || !data || data.length === 0 || canvasWidth === 0) return;

			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const barWidth = calculateBarWidth();
			const totalBarWidth = barWidth + gap;

			// Find which bar the mouse is over
			let foundIndex = -1;

			for (let i = 0; i < data.length; i++) {
				const barStart = Math.round(i * totalBarWidth);
				const barEnd = Math.round((i + 1) * totalBarWidth) - Math.round(gap);

				if (mouseX >= barStart && mouseX < barEnd) {
					foundIndex = i;

					break;
				}
			}

			if (foundIndex >= 0) {
				const barX = Math.round(foundIndex * totalBarWidth) + Math.round(barWidth) / 2;

				hoveredBar = { index: foundIndex, x: barX, data: data[foundIndex] };

				// Only redraw if hovered index changed
				if (hoveredIndex !== foundIndex) {
					hoveredIndex = foundIndex;
					drawBars(foundIndex);
				}
			} else {
				hoveredBar = null;

				if (hoveredIndex !== null) {
					hoveredIndex = null;
					drawBars(null);
				}
			}
		}

		function handleMouseLeave() {
			hoveredBar = null;

			if (hoveredIndex !== null) {
				hoveredIndex = null;
				drawBars(null);
			}
		}

		function handleBarClick(event) {
			if (disableClick || !hoveredBar || !data) return;

			const barData = data[hoveredBar.index];
			const total = barData.countOfUp + barData.countOfDown + barData.countOfDegraded + barData.countOfMaintenance;

			// Determine status for the day
			let status = "NO_DATA";

			if (total > 0) {
				if (barData.countOfDown > 0) status = "DOWN"; else if (barData.countOfDegraded > 0) status = "DEGRADED"; else if (barData.countOfMaintenance > 0) status = "MAINTENANCE"; else status = "UP";
			}

			trackEvent("status_calendar_day_opened", { monitorTag, status, timestamp: barData.ts });
			selectedDay = { timestamp: barData.ts, status };
			dialogOpen = true;
		}

		function handleDialogClose() {
			selectedDay = null;
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
			mounted = true;
			dpr = window.devicePixelRatio || 1;

			return () => {
				resizeObserver?.disconnect();
			};
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class(`relative w-full ${$.stringify(className)}`)}><div class="overflow-hidden"${$.attr_style(`border-radius: ${$.stringify(radius)}px;`)}><canvas${$.attr_style(`width: 100%; height: ${$.stringify(barHeight + 8)}px;`)} class="cursor-pointer svelte-1rbx4p5"${$.attr('aria-label', `Status calendar showing ${$.stringify(data.length)}-day uptime data`)}></canvas></div> `);

			if (hoveredBar) {
				$$renderer.push(`<!--[0--><div class="bg-popover text-popver-foreground pointer-events-none absolute z-20 w-max -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap"${$.attr_style(tooltipStyle())}><span${$.attr_class($.clsx(getStatusColor(hoveredBar.data)))}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(GetStatusSummary(hoveredBar.data)))}</span> <span class="text-muted-foreground">@</span> ${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(hoveredBar.data.ts, page.data.dateAndTimeFormat.dateOnly))} `);

				if (hoveredBar.data.avgLatency > 0) {
					$$renderer.push(`<!--[0--><span class="text-muted-foreground ml-1">|</span> <span class="ml-1">${$.escape(ParseLatency(hoveredBar.data.avgLatency))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			MonitorDayDetail($$renderer, {
				monitorTag,
				selectedDay,
				get open() {
					return dialogOpen;
				},

				set open($$value) {
					dialogOpen = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}