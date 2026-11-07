import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { calculatePosition, getAbsParent } from "@svar-ui/lib-dom";
import Portal from "./Portal.svelte";

var root = $.from_html(`<div class="wx-tooltip-text svelte-5wzvst"> </div>`);
var root_1 = $.from_html(`<div role="tooltip"><div class="wx-tooltip-wrapper"><div class="wx-tooltip-inner svelte-5wzvst"><!></div></div></div>`);
var root_2 = $.from_html(`<div class="wx-tooltip-area svelte-5wzvst" role="none"><!> <!></div>`);

export default function Tooltip($$anchor, $$props) {
	$.push($$props, true);

	const at = $.prop($$props, 'at', 3, "top-center"),
		arrow = $.prop($$props, 'arrow', 3, false),
		touch = $.prop($$props, 'touch', 3, false),
		overflow = $.prop($$props, 'overflow', 3, false),
		delay = $.prop($$props, 'delay', 3, 300),
		Content = $.prop($$props, 'content', 3, null),
		resolver = $.prop($$props, 'resolver', 3, defaultResolver),
		css = $.prop($$props, 'css', 3, "");

	const side = $.derived(() => getSide(at()));
	const align = $.derived(() => getAlign(at()));

	const resolvedAt = $.derived(() => {
		if (at() === "point") return "point";

		return `${$.get(side)}-${$.get(align)}`;
	});

	let areaNode;
	let isHovered = false;
	let tooltipNode = $.state(null);
	let match = $.state(null // { result, anchor, mouseX, mouseY }
	);
	let position = $.state(null // { x, y, z, side, arrowOffset }
	);
	let firstAnchor = $.state(false);

	// render only when there is displayable content
	const shouldRender = $.derived(() => $.get(match) !== null && (!!$.get(match).result || Content() != null));

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
		return readCSSPropertyInt($.get(tooltipNode), "--wx-tooltip-point-offset", 14);
	}

	function getArrowSize() {
		return readCSSPropertyInt($.get(tooltipNode), "--wx-tooltip-arrow-size", 6);
	}

	// Compute the CSS arrow offset relative to the anchor
	function getArrowOffset(arrowSize, result, rect, body) {
		if ($.get(side) === "point") return "50%";

		const bodyRect = body?.getBoundingClientRect() ?? { top: 0, left: 0 };
		const h = arrowSize / 2;
		let anchorPoint;
		let tooltipEdge;

		if ($.get(side) === "top" || $.get(side) === "bottom") {
			tooltipEdge = result.x - (body?.scrollLeft ?? 0) + bodyRect.left;

			if ($.get(align) === "start") anchorPoint = rect.left + arrowSize + h; else if ($.get(align) === "end") anchorPoint = rect.right - arrowSize - h; else anchorPoint = rect.left + rect.width / 2;
		} else {
			tooltipEdge = result.y - (body?.scrollTop ?? 0) + bodyRect.top;

			if ($.get(align) === "start") anchorPoint = rect.top + arrowSize + h; else if ($.get(align) === "end") anchorPoint = rect.bottom - arrowSize - h; else anchorPoint = rect.top + rect.height / 2;
		}

		return `${anchorPoint - tooltipEdge}px`;
	}

	// Positioning of the tooltip
	$.user_effect(() => {
		if (!$.get(tooltipNode) || !$.get(match)) return void $.set(position, null);

		// Offset from the mouse cursor when at="point"
		const offset = at() === "point" ? getPointOffset() : 0;

		// Calculate the position of the tooltip
		const result = calculatePosition($.get(tooltipNode), $.get(match).anchor, $.get(resolvedAt), $.get(match).mouseX + offset, $.get(match).mouseY + offset);

		if (result === null) return void $.set(position, null);

		// Detect if calculatePosition flipped to the opposite side
		const anchorRect = $.get(match).anchor.getBoundingClientRect();

		const body = getAbsParent($.get(tooltipNode));
		const realSide = getSide(result.at);

		// Add gap for the arrow if needed, using realSide for direction
		let arrowOffset = "50%";

		if (result && arrow() && at() !== "point") {
			const arrowSize = getArrowSize();

			if (realSide === "top") result.y -= arrowSize; else if (realSide === "bottom") result.y += arrowSize; else if (realSide === "left") result.x -= arrowSize; else if (realSide === "right") result.x += arrowSize;

			arrowOffset = getArrowOffset(arrowSize, result, anchorRect, body);
		}

		// Submit the result to the position state
		const minZ = readCSSPropertyInt($.get(tooltipNode), "--wx-tooltip-z-index", 1002);

		$.set(
			position,
			{
				x: Math.round(result.x),
				y: Math.round(result.y),
				z: Math.max(result.z, minZ),
				side: realSide,
				arrowOffset
			},
			true
		);
	});

	function defaultResolver(element) {
		if (overflow() && element.scrollWidth <= element.clientWidth) return null;

		const text = element.getAttribute?.("data-tooltip-text");

		return text ? text : null;
	}

	function walk(node, ev) {
		if (!isHovered) return null;

		// Disable tooltip on touch devices if prop touch == false
		const touchD = "ontouchstart" in window || navigator.maxTouchPoints > 0;

		if (touchD && !touch()) return null;

		for (; node && node !== areaNode; node = node.parentNode) {
			if (node.nodeType !== Node.ELEMENT_NODE) continue;

			const result = resolver()(node, ev);

			if (result == null) continue;

			return { result, anchor: node, mouseX: ev.clientX, mouseY: ev.clientY };
		}

		return null;
	}

	let timer;
	let hiding = false;

	function debounce(fn, ...args) {
		clearTimeout(timer);
		timer = setTimeout(fn, delay(), ...args);
	}

	function onmousemove(ev) {
		// (1) Ignore if the most closely hovered tooltip area is not this one (in case of nested tooltips)
		if (ev.target.closest(".wx-tooltip-area") !== areaNode) {
			isHovered = false;
			$.set(match, null);
			clearTimeout(timer);

			return;
		}

		isHovered = true;

		// (2) If the cursor is still within the anchor element
		if ($.get(match)?.anchor?.contains(ev.target)) {
			clearTimeout(timer);
			hiding = false;

			const result = resolver()(ev.target, ev);

			if (result != null) {
				$.set(
					match,
					{
						result,
						anchor: ev.target,
						mouseX: ev.clientX,
						mouseY: ev.clientY
					},
					true
				);

				return;
			}
		}

		// (3) Cursor left the anchor - walk for a new anchor
		if ($.get(match) !== null) {
			const result = walk(ev.target, ev);

			if (!result) {
				if (!hiding) {
					hiding = true;

					debounce(() => {
						hiding = false;
						$.set(match, null);
					});
				}
			} else {
				clearTimeout(timer);
				hiding = false;
				$.set(match, result, true);
				$.set(firstAnchor, false);
			}
		} else {
			debounce(() => {
				$.set(match, walk(ev.target, ev), true);
				$.set(firstAnchor, true);
			});
		}
	}

	function onmouseleave() {
		debounce(() => {
			hiding = false;
			isHovered = false;
			$.set(match, null);
		});
	}

	function onscroll() {
		clearTimeout(timer);
		$.set(match, null);
	}

	$.user_effect(() => {
		window.addEventListener("scroll", onscroll, { capture: true, passive: true });

		return () => {
			clearTimeout(timer);
			window.removeEventListener("scroll", onscroll, { capture: true });
		};
	});

	var div = root_2();
	var node_1 = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			Portal($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var div_1 = root_1();
					let classes;
					var div_2 = $.child(div_1);
					var div_3 = $.child(div_2);
					var node_2 = $.child(div_3);

					{
						var consequent_1 = ($$anchor) => {
							var fragment_1 = $.comment();
							var node_3 = $.first_child(fragment_1);

							{
								var consequent = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_4 = $.first_child(fragment_2);

									$.component(node_4, Content, ($$anchor, Content_1) => {
										Content_1($$anchor, {
											get data() {
												return $.get(match).result;
											}
										});
									});

									$.append($$anchor, fragment_2);
								};

								var alternate = ($$anchor) => {
									var div_4 = root();
									var text_1 = $.only_child(div_4, true);

									$.template_effect(() => $.set_text(text_1, $.get(match).result));
									$.append($$anchor, div_4);
								};

								$.if(node_3, ($$render) => {
									if (Content()) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_1);
						};

						var consequent_2 = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, Content, ($$anchor, Content_2) => {
								Content_2($$anchor, $.spread_props(() => $.get(match).result));
							});

							$.append($$anchor, fragment_3);
						};

						var alternate_1 = ($$anchor) => {
							var div_5 = root();
							var text_2 = $.only_child(div_5, true);

							$.template_effect(() => $.set_text(text_2, $.get(match).result?.data));
							$.append($$anchor, div_5);
						};

						$.if(node_2, ($$render) => {
							if (typeof $.get(match).result === "string") $$render(consequent_1); else if (Content()) $$render(consequent_2, 1); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_3);
					$.reset(div_2);
					$.reset(div_1);
					$.bind_this(div_1, ($$value) => $.set(tooltipNode, $$value), () => $.get(tooltipNode));

					$.template_effect(() => {
						classes = $.set_class(div_1, 1, `wx-tooltip ${css()}`, 'svelte-5wzvst', classes, {
							'wx-arrow-top': arrow() && $.get(position)?.side === "top",
							'wx-arrow-bottom': arrow() && $.get(position)?.side === "bottom",
							'wx-arrow-left': arrow() && $.get(position)?.side === "left",
							'wx-arrow-right': arrow() && $.get(position)?.side === "right",
							'wx-tooltip-transition': !$.get(firstAnchor)
						});

						$.set_style(div_1, `
					translate:${$.get(position)?.x ?? 0 ?? ''}px ${$.get(position)?.y ?? 0 ?? ''}px;
					z-index:${$.get(position)?.z ?? 20 ?? ''};
					${!$.get(position) ? 'visibility:hidden;' : ''}
					--wx-arrow-offset:${$.get(position)?.arrowOffset ?? '50%' ?? ''};
				`);
					});

					$.append($$anchor, div_1);
				},
				$$slots: { default: true }
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(shouldRender)) $$render(consequent_3);
		});
	}

	var node_6 = $.sibling(node_1, 2);

	$.snippet(node_6, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => areaNode = $$value, () => areaNode);
	$.delegated('mousemove', div, onmousemove);
	$.event('mouseleave', div, onmouseleave);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['mousemove']);