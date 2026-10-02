import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SvelteMap } from "svelte/reactivity";
import { cn } from "$lib/utils";
import { page } from "$app/state";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div class="absolute left-0 w-full bg-accent transition-all duration-450 ease-out"></div>`);
var root_1 = $.from_html(`<li class="transition-colors duration-150 ease-out"><a> </a></li>`);
var root_2 = $.from_html(`<nav class="sticky top-12 hidden px-3 lg:block"><div class="mb-2 flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/45 uppercase"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path></svg> On this page</div> <div class="relative flex px-2"><div class="pointer-events-none absolute top-0 left-1 h-full w-10"><div class="absolute inset-0 h-full w-full bg-border"></div> <!></div> <ol class="relative flex flex-col pl-3 text-sm"></ol></div></nav>`);
var root_3 = $.from_html(`<div class="hidden text-sm text-foreground/45 lg:block">No headings</div>`);

export default function TableOfContents($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const selector = $.derived(() => $$props.selector ?? "[data-doc-content] h2, [data-doc-content] h3");
	let headings = $.state($.proxy([]));
	let activeId = $.state("");
	let indicatorTop = $.state(0);
	let indicatorHeight = $.state(0);
	let indicatorBottom = $.state(0);
	let lineHeight = $.state(0);
	let svgPath = $.state("");
	let svgWidth = $.state(40);
	let indicatorRange = $.state(null);
	let pendingIndicatorFrame = null;
	const ACTIVE_OFFSET = 140;
	const VISIBLE_BUFFER = 24;
	const CORNER_RADIUS = 2;
	const linkRefs = new SvelteMap();
	const linkPositions = new SvelteMap();
	const headingOrder = new SvelteMap();
	let linksWrapper = $.state(null);
	const currentPath = $.derived(() => page.url.pathname);
	const slugify = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

	function registerLink(node, id) {
		let currentId = id ?? "";

		const assign = () => {
			if (!currentId) return;

			linkRefs.set(currentId, node);
		};

		assign();

		return {
			update(newId) {
				if (newId === currentId) return;

				if (currentId) {
					linkRefs.delete(currentId);
					linkPositions.delete(currentId);
				}

				currentId = newId ?? "";
				assign();
			},

			destroy() {
				if (currentId) {
					linkRefs.delete(currentId);
					linkPositions.delete(currentId);
				}
			}
		};
	}

	function buildRoundedPath(points, radius) {
		if (points.length === 0) return "";

		if (points.length === 1) {
			const [point] = points;

			return `M ${point.x} ${point.y}`;
		}

		const commands = [`M ${points[0].x} ${points[0].y}`];

		for (let i = 1; i < points.length; i++) {
			const point = points[i];
			const prev = points[i - 1];

			if (i === points.length - 1) {
				commands.push(` L ${point.x} ${point.y}`);

				continue;
			}

			const next = points[i + 1];
			const prevVecX = point.x - prev.x;
			const prevVecY = point.y - prev.y;
			const nextVecX = next.x - point.x;
			const nextVecY = next.y - point.y;
			const prevLen = Math.hypot(prevVecX, prevVecY);
			const nextLen = Math.hypot(nextVecX, nextVecY);

			if (prevLen === 0 || nextLen === 0) {
				commands.push(` L ${point.x} ${point.y}`);

				continue;
			}

			const prevDirX = prevVecX / prevLen;
			const prevDirY = prevVecY / prevLen;
			const nextDirX = nextVecX / nextLen;
			const nextDirY = nextVecY / nextLen;
			const dot = prevDirX * nextDirX + prevDirY * nextDirY;

			// Straight lines don't need rounding
			if (Math.abs(dot) > 0.999) {
				commands.push(` L ${point.x} ${point.y}`);

				continue;
			}

			const cornerRadius = Math.min(radius, prevLen / 2, nextLen / 2);
			const entryX = point.x - prevDirX * cornerRadius;
			const entryY = point.y - prevDirY * cornerRadius;
			const exitX = point.x + nextDirX * cornerRadius;
			const exitY = point.y + nextDirY * cornerRadius;

			commands.push(` L ${entryX} ${entryY}`);
			commands.push(` Q ${point.x} ${point.y} ${exitX} ${exitY}`);
		}

		return commands.join("");
	}

	function updateLayout() {
		if (!$.get(linksWrapper) || $.get(headings).length === 0) {
			$.set(lineHeight, 0);

			return;
		}

		linkPositions.clear();

		const polyline = [];
		let maxW = 0;
		const indentStep = 12;
		const strokeWidth = 1;
		const halfStroke = strokeWidth / 2;

		$.get(headings).forEach((heading) => {
			const node = linkRefs.get(heading.id);

			if (!node) return;

			const style = window.getComputedStyle(node);
			const paddingTop = parseFloat(style.paddingTop) || 0;
			const paddingBottom = parseFloat(style.paddingBottom) || 0;
			const positionTop = node.offsetTop + paddingTop;
			const positionBottom = node.offsetTop + node.offsetHeight - paddingBottom;
			const positionHeight = Math.max(0, positionBottom - positionTop);

			linkPositions.set(heading.id, { top: positionTop, height: positionHeight });

			const x = (heading.level - 2) * indentStep + halfStroke;
			const top = positionTop;
			const bottom = Math.max(positionTop, positionBottom);

			polyline.push({ x, y: top });
			polyline.push({ x, y: bottom });
			maxW = Math.max(maxW, x + halfStroke);
		});

		$.set(svgPath, buildRoundedPath(polyline, CORNER_RADIUS), true);
		$.set(svgWidth, Math.max(40, maxW + 10), true);
		$.set(lineHeight, $.get(linksWrapper).scrollHeight, true);
	}

	function updateIndicator(range) {
		const appliedRange = range ?? $.get(indicatorRange) ?? ($.get(activeId)
			? { startId: $.get(activeId), endId: $.get(activeId) }
			: null);

		if (!appliedRange) {
			$.set(indicatorRange, null);
			$.set(indicatorTop, 0);
			$.set(indicatorHeight, 0);
			$.set(indicatorBottom, 0);

			return;
		}

		if (range) {
			$.set(indicatorRange, range, true);
		} else if (!$.get(indicatorRange)) {
			$.set(indicatorRange, appliedRange, true);
		}

		const startPos = linkPositions.get(appliedRange.startId);
		const endPos = linkPositions.get(appliedRange.endId);

		if (!startPos || !endPos) {
			$.set(indicatorTop, 0);
			$.set(indicatorHeight, 0);
			$.set(indicatorBottom, 0);

			return;
		}

		const top = Math.min(startPos.top, endPos.top);
		const bottom = Math.max(startPos.top + startPos.height, endPos.top + endPos.height);

		$.set(indicatorTop, top, true);
		$.set(indicatorHeight, Math.max(0, bottom - top), true);
		$.set(indicatorBottom, bottom, true);
	}

	function scheduleIndicatorUpdate(range) {
		if (typeof window === "undefined") {
			if (range) {
				updateIndicator(range);
			} else {
				updateIndicator();
			}

			return;
		}

		if (pendingIndicatorFrame !== null) {
			window.cancelAnimationFrame(pendingIndicatorFrame);
		}

		pendingIndicatorFrame = window.requestAnimationFrame(() => {
			pendingIndicatorFrame = null;

			if (range) {
				updateIndicator(range);
			} else {
				updateIndicator();
			}
		});
	}

	function collectHeadings() {
		if (typeof document === "undefined") {
			$.set(headings, [], true);
			$.set(activeId, "");
			$.set(lineHeight, 0);
			$.set(indicatorTop, 0);
			$.set(indicatorHeight, 0);
			$.set(indicatorBottom, 0);
			$.set(indicatorRange, null);
			headingOrder.clear();

			return undefined;
		}

		const slugCounts = new SvelteMap();
		const nodeList = Array.from(document.querySelectorAll($.get(selector))).filter((node) => node instanceof HTMLElement);
		const parsed = [];

		for (const node of nodeList) {
			const text = node.textContent?.trim() ?? "";

			if (!text) continue;

			let id = node.id;

			if (!id) {
				let baseSlug = slugify(text);

				if (!baseSlug) {
					baseSlug = `section-${parsed.length + 1}`;
				}

				const count = slugCounts.get(baseSlug);

				if (typeof count === "number") {
					const nextCount = count + 1;

					slugCounts.set(baseSlug, nextCount);
					baseSlug = `${baseSlug}-${nextCount}`;
				} else {
					slugCounts.set(baseSlug, 0);
				}

				id = baseSlug;
				node.id = id;
			}

			const level = Number(node.tagName.replace("H", "")) || 2;

			parsed.push({ id, text, level, element: node });
		}

		headingOrder.clear();

		parsed.forEach(({ id }, index) => {
			headingOrder.set(id, index);
		});

		$.set(headings, parsed.map(({ element: _element, ...rest }) => rest), true);
		$.set(activeId, parsed[0]?.id ?? "", true);
		$.set(lineHeight, 0);
		$.set(indicatorTop, 0);
		$.set(indicatorHeight, 0);
		$.set(indicatorBottom, 0);
		$.set(indicatorRange, null);
		requestAnimationFrame(() => updateLayout());

		if (!parsed.length) {
			return undefined;
		}

		const updateActive = () => {
			let current = parsed[0]?.id ?? "";
			const container = document.getElementById("docs-content-container") ?? window;
			const isWindow = container === window;
			const scrollY = isWindow ? window.scrollY : container.scrollTop;
			const viewportHeight = isWindow ? window.innerHeight : container.clientHeight;

			const scrollHeight = isWindow
				? document.documentElement.scrollHeight
				: container.scrollHeight;

			const containerBounds = isWindow
				? { top: 0, bottom: viewportHeight }
				: container.getBoundingClientRect();

			const viewportTop = containerBounds.top - VISIBLE_BUFFER;
			const viewportBottom = containerBounds.bottom + VISIBLE_BUFFER;
			const visibleIds = [];

			for (const item of parsed) {
				const rect = item.element.getBoundingClientRect();

				if (rect.bottom >= viewportTop && rect.top <= viewportBottom) {
					visibleIds.push(item.id);
				}

				if (rect.top - ACTIVE_OFFSET <= viewportTop + VISIBLE_BUFFER) {
					current = item.id;
				}
			}

			const last = parsed[parsed.length - 1];

			if (last) {
				const scrolledBottom = scrollY + viewportHeight;

				if (scrolledBottom >= scrollHeight - 20) {
					current = last.id;
				}
			}

			$.set(activeId, current, true);

			const range = visibleIds.length > 0
				? {
					startId: visibleIds[0],
					endId: visibleIds[visibleIds.length - 1]
				}
				: current ? { startId: current, endId: current } : null;

			scheduleIndicatorUpdate(range);
		};

		const container = document.getElementById("docs-content-container") ?? window;

		if (parsed.length > 0) {
			const isWindow = container === window;
			const scrollY = isWindow ? window.scrollY : container.scrollTop;

			if (scrollY < ACTIVE_OFFSET) {
				$.set(activeId, parsed[0].id, true);

				const initialRange = { startId: $.get(activeId), endId: $.get(activeId) };

				scheduleIndicatorUpdate(initialRange);
			} else {
				updateActive();
			}
		}

		const handleResize = () => {
			updateActive();
			updateLayout();
		};

		container.addEventListener("scroll", updateActive, { passive: true });
		window.addEventListener("resize", handleResize);

		return () => {
			container.removeEventListener("scroll", updateActive);
			window.removeEventListener("resize", handleResize);

			if (pendingIndicatorFrame !== null) {
				window.cancelAnimationFrame(pendingIndicatorFrame);
				pendingIndicatorFrame = null;
			}
		};
	}

	function isLinkHighlighted(id) {
		if (!$.get(indicatorRange)) {
			return $.get(activeId) === id;
		}

		const startIndex = headingOrder.get($.get(indicatorRange).startId);
		const endIndex = headingOrder.get($.get(indicatorRange).endId);
		const currentIndex = headingOrder.get(id);

		if (startIndex === undefined || endIndex === undefined || currentIndex === undefined) {
			return $.get(activeId) === id;
		}

		const min = Math.min(startIndex, endIndex);
		const max = Math.max(startIndex, endIndex);

		return currentIndex >= min && currentIndex <= max;
	}

	$.user_effect(() => {
		const path = $.get(currentPath);

		void path;

		let cleanup;

		const timer = setTimeout(
			() => {
				cleanup = collectHeadings();
			},
			50
		);

		return () => {
			clearTimeout(timer);
			cleanup?.();
		};
	});

	$.user_effect(() => {
		if (typeof window === "undefined" || !$.get(linksWrapper)) return;

		const observer = new ResizeObserver(() => {
			updateLayout();
			updateIndicator();
		});

		observer.observe($.get(linksWrapper));

		return () => {
			observer.disconnect();
		};
	});

	var fragment = $.comment();
	var node_1 = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var nav = root_2();
			var div = $.sibling($.child(nav), 2);
			var div_1 = $.child(div);
			var node_2 = $.sibling($.child(div_1), 2);

			{
				var consequent = ($$anchor) => {
					var div_2 = root();

					$.template_effect(($0) => $.set_style(div_2, $0), [
						() => `
                            top: ${$.get(indicatorTop)}px;
                            bottom: ${Math.max(0, $.get(lineHeight) - $.get(indicatorBottom))}px;
                        `
					]);

					$.append($$anchor, div_2);
				};

				$.if(node_2, ($$render) => {
					if ($.get(indicatorHeight) > 0) $$render(consequent);
				});
			}

			$.reset(div_1);

			var ol = $.sibling(div_1, 2);

			$.each(ol, 21, () => $.get(headings), (heading) => heading.id, ($$anchor, heading) => {
				var li = root_1();
				var a = $.child(li);
				var text_1 = $.only_child(a, true);

				$.action(a, ($$node, $$action_arg) => registerLink?.($$node, $$action_arg), () => $.get(heading).id);
				$.reset(li);

				$.template_effect(
					($0) => {
						$.set_style(li, `padding-left: ${($.get(heading).level - 2) * 12}px`);
						$.set_attribute(a, 'href', `#${$.get(heading).id}`);
						$.set_class(a, 1, $0);
						$.set_text(text_1, $.get(heading).text);
					},
					[
						() => $.clsx(cn("block py-1.5 transition-[color] duration-150 ease-out", isLinkHighlighted($.get(heading).id)
							? "text-accent"
							: "text-foreground/70 hover:text-foreground"))
					]
				);

				$.append($$anchor, li);
			});

			$.reset(ol);
			$.bind_this(ol, ($$value) => $.set(linksWrapper, $$value), () => $.get(linksWrapper));
			$.reset(div);
			$.reset(nav);

			$.template_effect(() => $.set_style(div_1, `
                    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${$.get(svgWidth)} ${$.get(lineHeight)}' width='${$.get(svgWidth)}' height='${$.get(lineHeight)}' preserveAspectRatio='none'%3E%3Cpath d='${$.get(svgPath)}' stroke='black' stroke-width='1' fill='none'/%3E%3C/svg%3E");
                    -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${$.get(svgWidth)} ${$.get(lineHeight)}' width='${$.get(svgWidth)}' height='${$.get(lineHeight)}' preserveAspectRatio='none'%3E%3Cpath d='${$.get(svgPath)}' stroke='black' stroke-width='1' fill='none'/%3E%3C/svg%3E");
                    mask-repeat: no-repeat;
                    -webkit-mask-repeat: no-repeat;
                    mask-position: left top;
                    -webkit-mask-position: left top;
                    mask-size: 100% 100%;
                    -webkit-mask-size: 100% 100%;
                `));

			$.append($$anchor, nav);
		};

		var alternate = ($$anchor) => {
			var div_3 = root_3();

			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(headings).length > 0) $$render(consequent_1); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}