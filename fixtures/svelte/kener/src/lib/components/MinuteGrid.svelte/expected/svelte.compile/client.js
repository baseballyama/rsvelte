import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from "svelte";
import { mode } from "mode-watcher";
import { page } from "$app/state";
import TrendingUp from "@lucide/svelte/icons/trending-up";
import { t } from "$lib/stores/i18n";
import { formatDate } from "$lib/stores/datetime";
import { selectedTimezone } from "$lib/stores/timezone";
import { toZonedTime } from "date-fns-tz";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<p> </p>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<canvas class="cursor-default svelte-miahek"></canvas>`);
var root_4 = $.from_html(`<div style="height: 50px;"></div>`);
var root_5 = $.from_html(`<div class="bg-popover text-popover-foreground border-border pointer-events-none absolute z-20 w-max -translate-x-1/2 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap"><span> </span></div>`);
var root_6 = $.from_html(`<div class="space-y-4"><div class="text-foreground mb-2 flex items-center justify-between text-sm font-medium"><p> </p> <div class="flex items-center gap-1"><!></div></div> <div class="relative w-full"><!> <!></div></div>`);

export default function MinuteGrid($$anchor, $$props) {
	$.push($$props, true);

	const $selectedTimezone = () => $.store_get(selectedTimezone, '$selectedTimezone', $$stores);
	const $t = () => $.store_get(t, '$t', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	// Canvas state
	let canvas = $.state(null);

	let container = $.state(null);
	let tooltipEl = $.state(null);
	let canvasWidth = $.state(0);
	let mounted = $.state(false);
	let dpr = $.state(1);
	let resizeObserver = null;

	// Hover state
	let hoveredMinute = $.state(null);

	// Layout constants
	const SQUARE_GAP = 1;

	const HOUR_LABEL_WIDTH = 0;
	const SECTION_LABEL_HEIGHT = 20;
	const SECTION_GAP = 12;
	const MINUTES_PER_HOUR = 60;
	const HOURS_PER_SECTION = 6;

	// Responsive square size: fit 60 squares + gaps into the available width
	let squareSize = $.derived(() => {
		if ($.get(canvasWidth) <= 0) return 10;

		const available = $.get(canvasWidth) - HOUR_LABEL_WIDTH;

		// 60 squares with gaps between them: 60 * size + 59 * gap <= available
		const size = Math.floor((available - (MINUTES_PER_HOUR - 1) * SQUARE_GAP) / MINUTES_PER_HOUR);

		return Math.max(3, Math.min(size, 10)); // clamp between 3px and 10px
	});

	let rowHeight = $.derived(() => $.get(squareSize) + SQUARE_GAP);

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

		for (const minute of $$props.minutes) {
			const date = toZonedTime(minute.timestamp * 1000, $selectedTimezone());
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

		for (const section of $.get(sections)) {
			height += SECTION_LABEL_HEIGHT;
			height += section.hours.length * $.get(rowHeight);
			height += SECTION_GAP;
		}

		return Math.max(height, 50);
	});

	// Tooltip positioning
	let tooltipStyle = $.derived(() => {
		if (!$.get(hoveredMinute) || !$.get(tooltipEl) || $.get(canvasWidth) <= 0) {
			return `left: 0px; top: 0px; opacity: 0; pointer-events: none;`;
		}

		const tooltipWidth = $.get(tooltipEl).offsetWidth || 0;
		const halfTooltip = tooltipWidth / 2;
		const padding = 4;
		let left = $.get(hoveredMinute).x;
		const minLeft = halfTooltip + padding;
		const maxLeft = Math.max($.get(canvasWidth) - halfTooltip - padding, minLeft);

		if (left < minLeft) left = minLeft; else if (left > maxLeft) left = maxLeft;

		const top = Math.max($.get(hoveredMinute).y - 28, 0);

		return `left: ${left}px; top: ${top}px;`;
	});

	function getStatusColor(status) {
		const s = status.toUpperCase();

		if (s === "UP") return $.get(colorUp);
		if (s === "DOWN") return $.get(colorDown);
		if (s === "DEGRADED") return $.get(colorDegraded);
		if (s === "MAINTENANCE") return $.get(colorMaintenance);

		return mode.current === "dark" ? "#27272a" : "#e4e4e7";
	}

	// Build a lookup map for hit testing
	let minuteRects = [];

	function drawCanvas() {
		if (!$.get(canvas) || $.get(canvasWidth) === 0 || !$.get(mounted) || $.get(sections).length === 0) return;

		const ctx = $.get(canvas).getContext("2d");

		if (!ctx) return;

		// Scale for high-DPI
		const scaledWidth = Math.floor($.get(canvasWidth) * $.get(dpr));

		const scaledHeight = Math.floor($.get(canvasHeight) * $.get(dpr));

		$.get(canvas).width = scaledWidth;
		$.get(canvas).height = scaledHeight;
		ctx.scale($.get(dpr), $.get(dpr));

		// Clear
		ctx.clearRect(0, 0, $.get(canvasWidth), $.get(canvasHeight));

		// Reset minute rects for hit testing
		minuteRects = [];

		// Text styling
		const labelColor = mode.current === "dark" ? "#a1a1aa" : "#71717a";

		ctx.textBaseline = "middle";

		let currentY = 0;

		for (const section of $.get(sections)) {
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
					const x = HOUR_LABEL_WIDTH + minIdx * ($.get(squareSize) + SQUARE_GAP);
					const y = currentY;

					ctx.fillStyle = getStatusColor(minute.status);
					ctx.fillRect(x, y, $.get(squareSize), $.get(squareSize));

					// Store rect for hit testing
					minuteRects.push({
						x,
						y,
						width: $.get(squareSize),
						height: $.get(squareSize),
						data: minute
					});
				}

				currentY += $.get(rowHeight);
			}

			currentY += SECTION_GAP;
		}
	}

	function handleMouseMove(event) {
		if (!$.get(canvas)) return;

		const rect = $.get(canvas).getBoundingClientRect();
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
			$.set(hoveredMinute, { x: found.x + found.width / 2, y: found.y, data: found.data }, true);
		} else {
			$.set(hoveredMinute, null);
		}
	}

	function handleMouseLeave() {
		$.set(hoveredMinute, null);
	}

	onMount(() => {
		$.set(mounted, true);
		$.set(dpr, window.devicePixelRatio || 1, true);

		return () => {
			resizeObserver?.disconnect();
		};
	});

	// Set up resize observer
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
		const _sections = $.get(sections);
		const _mode = mode.current;
		const _height = $.get(canvasHeight);

		if (_width > 0 && _sections.length > 0 && $.get(mounted)) {
			drawCanvas();
		}
	});

	var div = root_6();
	var div_1 = $.child(div);
	var p = $.child(div_1);
	var text = $.only_child(p, true);
	var div_2 = $.sibling(p, 2);
	var node = $.child(div_2);

	$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
		Tooltip_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
					Tooltip_Trigger($$anchor, {
						class: 'flex items-center gap-1',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							TrendingUp(node_2, { class: 'h-3 w-3' });

							var text_1 = $.sibling(node_2);

							$.template_effect(() => $.set_text(text_1, ` ${$$props.uptime ?? ''}%`));
							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
					Tooltip_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var p_1 = root_1();
							var text_2 = $.only_child(p_1, true);

							$.template_effect(($0) => $.set_text(text_2, $0), [() => $t()("Day Uptime")]);
							$.append($$anchor, p_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_4 = $.child(div_3);

	{
		var consequent = ($$anchor) => {
			var canvas_1 = root_3();

			$.bind_this(canvas_1, ($$value) => $.set(canvas, $$value), () => $.get(canvas));

			$.template_effect(
				($0) => {
					$.set_style(canvas_1, `width: 100%; height: ${$.get(canvasHeight) ?? ''}px;`);
					$.set_attribute(canvas_1, 'aria-label', $0);
				},
				[() => $t()("Per-Minute Status")]
			);

			$.delegated('mousemove', canvas_1, handleMouseMove);
			$.event('mouseleave', canvas_1, handleMouseLeave);
			$.append($$anchor, canvas_1);
		};

		var alternate = ($$anchor) => {
			var div_4 = root_4();

			$.append($$anchor, div_4);
		};

		$.if(node_4, ($$render) => {
			if ($.get(mounted) && $.get(canvasHeight) > 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_5 = root_5();
			var span = $.child(div_5);
			var text_3 = $.only_child(span);

			$.reset(div_5);
			$.bind_this(div_5, ($$value) => $.set(tooltipEl, $$value), () => $.get(tooltipEl));

			$.template_effect(
				($0, $1, $2) => {
					$.set_style(div_5, $.get(tooltipStyle));
					$.set_class(span, 1, `text-${$0 ?? ''}`);
					$.set_text(text_3, `${$1 ?? ''} @ ${$2 ?? ''}`);
				},
				[
					() => $.get(hoveredMinute).data.status.toLowerCase(),
					() => $t()($.get(hoveredMinute).data.status),
					() => $formatDate()($.get(hoveredMinute).data.timestamp, page.data.dateAndTimeFormat.timeOnly)
				]
			);

			$.append($$anchor, div_5);
		};

		$.if(node_5, ($$render) => {
			if ($.get(hoveredMinute)) $$render(consequent_1);
		});
	}

	$.reset(div_3);
	$.bind_this(div_3, ($$value) => $.set(container, $$value), () => $.get(container));
	$.reset(div);
	$.template_effect(($0) => $.set_text(text, $0), [() => $t()("Per-Minute Status")]);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['mousemove']);