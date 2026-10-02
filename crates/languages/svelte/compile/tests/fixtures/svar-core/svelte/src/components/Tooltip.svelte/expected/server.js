import * as $ from 'svelte/internal/server';
import { calculatePosition, getAbsParent } from "@svar-ui/lib-dom";
import Portal from "./Portal.svelte";

export default function Tooltip($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const {
			at = "top-center",
			arrow = false,
			touch = false,
			overflow = false,
			delay = 300,
			content: Content = null,
			resolver = defaultResolver,
			children,
			css = ""
		} = $$props;

		const side = $.derived(() => getSide(at));
		const align = $.derived(() => getAlign(at));

		const resolvedAt = $.derived(() => {
			if (at === "point") return "point";

			return `${side()}-${align()}`;
		});

		let areaNode;
		let isHovered = false;
		let tooltipNode = null;
		let match = null; // { result, anchor, mouseX, mouseY }
		let position = null; // { x, y, z, side, arrowOffset }
		let firstAnchor = false;

		// render only when there is displayable content
		const shouldRender = $.derived(() => match !== null && (!!match.result || Content != null));

		function getSide(at) {
			if (at === "point") return "point";

			const split = at.split("-");

			return split[0];
		}

		function getAlign(at) {
			if (at === "point") return "center";

			const split = at.split("-");

			return split.length === 1 ? "center" : split[1];
		}

		function readCSSPropertyInt(node, property, defaultValue) {
			const value = getComputedStyle(node).getPropertyValue(property);

			return parseInt(value) || defaultValue;
		}

		function getPointOffset() {
			return readCSSPropertyInt(tooltipNode, "--wx-tooltip-point-offset", 14);
		}

		function getArrowSize() {
			return readCSSPropertyInt(tooltipNode, "--wx-tooltip-arrow-size", 6);
		}

		// Compute the CSS arrow offset relative to the anchor
		function getArrowOffset(arrowSize, result, rect, body) {
			if (side() === "point") return "50%";

			const bodyRect = body?.getBoundingClientRect() ?? { top: 0, left: 0 };
			const h = arrowSize / 2;
			let anchorPoint;
			let tooltipEdge;

			if (side() === "top" || side() === "bottom") {
				tooltipEdge = result.x - (body?.scrollLeft ?? 0) + bodyRect.left;

				if (align() === "start") anchorPoint = rect.left + arrowSize + h; else if (align() === "end") anchorPoint = rect.right - arrowSize - h; else anchorPoint = rect.left + rect.width / 2;
			} else {
				tooltipEdge = result.y - (body?.scrollTop ?? 0) + bodyRect.top;

				if (align() === "start") anchorPoint = rect.top + arrowSize + h; else if (align() === "end") anchorPoint = rect.bottom - arrowSize - h; else anchorPoint = rect.top + rect.height / 2;
			}

			return `${anchorPoint - tooltipEdge}px`;
		}

		// Positioning of the tooltip
		// Offset from the mouse cursor when at="point"
		// Calculate the position of the tooltip
		// Detect if calculatePosition flipped to the opposite side
		// Add gap for the arrow if needed, using realSide for direction
		// Submit the result to the position state
		function defaultResolver(element) {
			if (overflow && element.scrollWidth <= element.clientWidth) return null;

			const text = element.getAttribute?.("data-tooltip-text");

			return text ? text : null;
		}

		function walk(node, ev) {
			if (!isHovered) return null;

			// Disable tooltip on touch devices if prop touch == false
			const touchD = "ontouchstart" in window || navigator.maxTouchPoints > 0;

			if (touchD && !touch) return null;

			for (; node && node !== areaNode; node = node.parentNode) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;

				const result = resolver(node, ev);

				if (result == null) continue;

				return { result, anchor: node, mouseX: ev.clientX, mouseY: ev.clientY };
			}

			return null;
		}

		let timer;
		let hiding = false;

		function debounce(fn, ...args) {
			clearTimeout(timer);
			timer = setTimeout(fn, delay, ...args);
		}

		function onmousemove(ev) {
			// (1) Ignore if the most closely hovered tooltip area is not this one (in case of nested tooltips)
			if (ev.target.closest(".wx-tooltip-area") !== areaNode) {
				isHovered = false;
				match = null;
				clearTimeout(timer);

				return;
			}

			isHovered = true;

			// (2) If the cursor is still within the anchor element
			if (match?.anchor?.contains(ev.target)) {
				clearTimeout(timer);
				hiding = false;

				const result = resolver(ev.target, ev);

				if (result != null) {
					match = {
						result,
						anchor: ev.target,
						mouseX: ev.clientX,
						mouseY: ev.clientY
					};

					return;
				}
			}

			// (3) Cursor left the anchor - walk for a new anchor
			if (match !== null) {
				const result = walk(ev.target, ev);

				if (!result) {
					if (!hiding) {
						hiding = true;

						debounce(() => {
							hiding = false;
							match = null;
						});
					}
				} else {
					clearTimeout(timer);
					hiding = false;
					match = result;
					firstAnchor = false;
				}
			} else {
				debounce(() => {
					match = walk(ev.target, ev);
					firstAnchor = true;
				});
			}
		}

		function onmouseleave() {
			debounce(() => {
				hiding = false;
				isHovered = false;
				match = null;
			});
		}

		function onscroll() {
			clearTimeout(timer);
			match = null;
		}

		$$renderer.push(`<div class="wx-tooltip-area svelte-5wzvst" role="none">`);

		if (shouldRender()) {
			$$renderer.push('<!--[0-->');

			Portal($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<div${$.attr_class(`wx-tooltip ${css}`, 'svelte-5wzvst', {
						'wx-arrow-top': arrow && position?.side === "top",
						'wx-arrow-bottom': arrow && position?.side === "bottom",
						'wx-arrow-left': arrow && position?.side === "left",
						'wx-arrow-right': arrow && position?.side === "right",
						'wx-tooltip-transition': !firstAnchor
					})} role="tooltip"${$.attr_style(` translate:${$.stringify(position?.x ?? 0)}px ${$.stringify(position?.y ?? 0)}px; z-index:${$.stringify(position?.z ?? 20)}; ${!position ? 'visibility:hidden;' : ''} --wx-arrow-offset:${$.stringify(position?.arrowOffset ?? '50%')}; `)}><div class="wx-tooltip-wrapper"><div class="wx-tooltip-inner svelte-5wzvst">`);

					if (typeof match.result === "string") {
						$$renderer.push('<!--[0-->');

						if (Content) {
							$$renderer.push('<!--[0-->');

							if (Content) {
								$$renderer.push('<!--[-->');
								Content($$renderer, { data: match.result });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						} else {
							$$renderer.push(`<!--[-1--><div class="wx-tooltip-text svelte-5wzvst">${$.escape(match.result)}</div>`);
						}

						$$renderer.push(`<!--]-->`);
					} else if (Content) {
						$$renderer.push('<!--[1-->');

						if (Content) {
							$$renderer.push('<!--[-->');
							Content($$renderer, $.spread_props([match.result]));
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					} else {
						$$renderer.push(`<!--[-1--><div class="wx-tooltip-text svelte-5wzvst">${$.escape(match.result?.data)}</div>`);
					}

					$$renderer.push(`<!--]--></div></div></div>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}