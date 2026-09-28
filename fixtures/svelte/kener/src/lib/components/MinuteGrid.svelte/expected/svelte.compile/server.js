import * as $ from 'svelte/internal/server';
import { onMount } from "svelte";
import { mode } from "mode-watcher";
import { page } from "$app/state";
import TrendingUp from "@lucide/svelte/icons/trending-up";
import { t } from "$lib/stores/i18n";
import { formatDate } from "$lib/stores/datetime";
import { selectedTimezone } from "$lib/stores/timezone";
import { toZonedTime } from "date-fns-tz";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";

export default function MinuteGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { minutes, uptime } = $$props;

		// Canvas state
		let canvas = null;

		let container = null;
		let tooltipEl = null;
		let canvasWidth = 0;
		let mounted = false;
		let dpr = 1;
		let resizeObserver = null;

		// Hover state
		let hoveredMinute = null;

		// Layout constants
		const SQUARE_GAP = 1;

		const HOUR_LABEL_WIDTH = 0;
		const SECTION_LABEL_HEIGHT = 20;
		const SECTION_GAP = 12;
		const MINUTES_PER_HOUR = 60;
		const HOURS_PER_SECTION = 6;

		// Responsive square size: fit 60 squares + gaps into the available width
		let squareSize = $.derived(() => {
			if (canvasWidth <= 0) return 10;

			const available = canvasWidth - HOUR_LABEL_WIDTH;

			// 60 squares with gaps between them: 60 * size + 59 * gap <= available
			const size = Math.floor((available - (MINUTES_PER_HOUR - 1) * SQUARE_GAP) / MINUTES_PER_HOUR);

			return Math.max(3, Math.min(size, 10)); // clamp between 3px and 10px
		});

		let rowHeight = $.derived(() => squareSize() + SQUARE_GAP);

		// Colors from page data
		const colorUp = $.derived(() => page.data.siteStatusColors?.UP || "#22c55e");

		const colorDown = $.derived(() => page.data.siteStatusColors?.DOWN || "#ef4444");
		const colorDegraded = $.derived(() => page.data.siteStatusColors?.DEGRADED || "#eab308");
		const colorMaintenance = $.derived(() => page.data.siteStatusColors?.MAINTENANCE || "#3b82f6");

		// Organize minutes into sections
		let sections = $.derived(() => {
			const result = [
				{ label: "00:00 - 05:59", startHour: 0, hours: [] },
				{ label: "06:00 - 11:59", startHour: 6, hours: [] },
				{ label: "12:00 - 17:59", startHour: 12, hours: [] },
				{ label: "18:00 - 23:59", startHour: 18, hours: [] }
			];

			// Group minutes by hour
			const minutesByHour = new Map();

			for (const minute of minutes) {
				const date = toZonedTime(minute.timestamp * 1000, $.store_get($$store_subs ??= {}, '$selectedTimezone', selectedTimezone));
				const hour = date.getHours();

				if (!minutesByHour.has(hour)) {
					minutesByHour.set(hour, []);
				}

				minutesByHour.get(hour).push(minute);
			}

			// Distribute hours to sections
			for (const section of result) {
				for (let h = 0; h < HOURS_PER_SECTION; h++) {
					const hour = section.startHour + h;
					const hourMinutes = minutesByHour.get(hour) || [];

					if (hourMinutes.length > 0) {
						hourMinutes.sort((a, b) => a.timestamp - b.timestamp);
						section.hours.push(hourMinutes);
					}
				}
			}

			return result.filter((s) => s.hours.length > 0);
		});

		// Calculate total canvas height
		let canvasHeight = $.derived(() => {
			let height = 0;

			for (const section of sections()) {
				height += SECTION_LABEL_HEIGHT;
				height += section.hours.length * rowHeight();
				height += SECTION_GAP;
			}

			return Math.max(height, 50);
		});

		// Tooltip positioning
		let tooltipStyle = $.derived(() => {
			if (!hoveredMinute || !tooltipEl || canvasWidth <= 0) {
				return `left: 0px; top: 0px; opacity: 0; pointer-events: none;`;
			}

			const tooltipWidth = tooltipEl.offsetWidth || 0;
			const halfTooltip = tooltipWidth / 2;
			const padding = 4;
			let left = hoveredMinute.x;
			const minLeft = halfTooltip + padding;
			const maxLeft = Math.max(canvasWidth - halfTooltip - padding, minLeft);

			if (left < minLeft) left = minLeft; else if (left > maxLeft) left = maxLeft;

			const top = Math.max(hoveredMinute.y - 28, 0);

			return `left: ${left}px; top: ${top}px;`;
		});

		function getStatusColor(status) {
			const s = status.toUpperCase();

			if (s === "UP") return colorUp();
			if (s === "DOWN") return colorDown();
			if (s === "DEGRADED") return colorDegraded();
			if (s === "MAINTENANCE") return colorMaintenance();

			return mode.current === "dark" ? "#27272a" : "#e4e4e7";
		}

		// Build a lookup map for hit testing
		let minuteRects = [];

		function drawCanvas() {
			if (!canvas || canvasWidth === 0 || !mounted || sections().length === 0) return;

			const ctx = canvas.getContext("2d");

			if (!ctx) return;

			// Scale for high-DPI
			const scaledWidth = Math.floor(canvasWidth * dpr);

			const scaledHeight = Math.floor(canvasHeight() * dpr);

			canvas.width = scaledWidth;
			canvas.height = scaledHeight;
			ctx.scale(dpr, dpr);

			// Clear
			ctx.clearRect(0, 0, canvasWidth, canvasHeight());

			// Reset minute rects for hit testing
			minuteRects = [];

			// Text styling
			const labelColor = mode.current === "dark" ? "#a1a1aa" : "#71717a";

			ctx.textBaseline = "middle";

			let currentY = 0;

			for (const section of sections()) {
				// Draw section label
				ctx.fillStyle = labelColor;

				ctx.font = "600 10px system-ui, -apple-system, sans-serif";
				ctx.fillText(section.label, 0, currentY + SECTION_LABEL_HEIGHT / 2);
				currentY += SECTION_LABEL_HEIGHT;

				// Draw hours
				for (let hourIdx = 0; hourIdx < section.hours.length; hourIdx++) {
					const hourMinutes = section.hours[hourIdx];

					// Draw minute squares
					for (let minIdx = 0; minIdx < hourMinutes.length; minIdx++) {
						const minute = hourMinutes[minIdx];
						const x = HOUR_LABEL_WIDTH + minIdx * (squareSize() + SQUARE_GAP);
						const y = currentY;

						ctx.fillStyle = getStatusColor(minute.status);
						ctx.fillRect(x, y, squareSize(), squareSize());

						// Store rect for hit testing
						minuteRects.push({
							x,
							y,
							width: squareSize(),
							height: squareSize(),
							data: minute
						});
					}

					currentY += rowHeight();
				}

				currentY += SECTION_GAP;
			}
		}

		function handleMouseMove(event) {
			if (!canvas) return;

			const rect = canvas.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const mouseY = event.clientY - rect.top;

			// Find which minute square the mouse is over
			let found = null;

			for (const mr of minuteRects) {
				if (mouseX >= mr.x && mouseX < mr.x + mr.width && mouseY >= mr.y && mouseY < mr.y + mr.height) {
					found = mr;

					break;
				}
			}

			if (found) {
				hoveredMinute = { x: found.x + found.width / 2, y: found.y, data: found.data };
			} else {
				hoveredMinute = null;
			}
		}

		function handleMouseLeave() {
			hoveredMinute = null;
		}

		onMount(() => {
			mounted = true;
			dpr = window.devicePixelRatio || 1;

			return () => {
				resizeObserver?.disconnect();
			};
		});

		$$renderer.push(`<div class="space-y-4"><div class="text-foreground mb-2 flex items-center justify-between text-sm font-medium"><p>${$.escape(
			// Set up resize observer
			// Redraw when data, width, or theme changes
			$.store_get($$store_subs ??= {}, '$t', t)("Per-Minute Status")
		)}</p> <div class="flex items-center gap-1">`);

		if (Tooltip.Root) {
			$$renderer.push('<!--[-->');

			Tooltip.Root($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Trigger) {
						$$renderer.push('<!--[-->');

						Tooltip.Trigger($$renderer, {
							class: 'flex items-center gap-1',
							children: ($$renderer) => {
								TrendingUp($$renderer, { class: 'h-3 w-3' });
								$$renderer.push(`<!----> ${$.escape(uptime)}%`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Tooltip.Content) {
						$$renderer.push('<!--[-->');

						Tooltip.Content($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Day Uptime"))}</p>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div></div> <div class="relative w-full">`);

		if (mounted && canvasHeight() > 0) {
			$$renderer.push(`<!--[0--><canvas${$.attr_style(`width: 100%; height: ${$.stringify(canvasHeight())}px;`)} class="cursor-default svelte-miahek"${$.attr('aria-label', $.store_get($$store_subs ??= {}, '$t', t)("Per-Minute Status"))}></canvas>`);
		} else {
			$$renderer.push(`<!--[-1--><div style="height: 50px;"></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (hoveredMinute) {
			$$renderer.push(`<!--[0--><div class="bg-popover text-popover-foreground border-border pointer-events-none absolute z-20 w-max -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap"${$.attr_style(tooltipStyle())}><span${$.attr_class(`text-${$.stringify(hoveredMinute.data.status.toLowerCase())}`)}>${$.escape($.store_get($$store_subs ??= {}, '$t', t)(hoveredMinute.data.status))} @ ${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(hoveredMinute.data.timestamp, page.data.dateAndTimeFormat.timeOnly))}</span></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}