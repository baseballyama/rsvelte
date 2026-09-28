import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as dom from "@floating-ui/dom";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fade } from "svelte/transition";
import Arrow from "./Arrow.svelte";
import { createMutualDebounce } from "./debounce";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'triggeredBy',
	'triggerDelay',
	'trigger',
	'placement',
	'offset',
	'arrow',
	'yOnly',
	'strategy',
	'role',
	'reference',
	'middlewares',
	'class',
	'arrowClass',
	'isOpen',
	'transitionParams',
	'transition',
	'onbeforetoggle',
	'ontoggle',
	'onclose',
	'children'
]);

var root = $.from_html(`<div><!> <!></div>`);
var root_1 = $.from_html(`<div hidden=""></div> <!>`, 1);

export default function Popper($$anchor, $$props) {
	$.push($$props, true);

	const DEFAULT_TRIGGER_DELAY = 200;
	const DEFAULT_OFFSET = 8;

	let triggerDelay = $.prop($$props, 'triggerDelay', 3, DEFAULT_TRIGGER_DELAY),
		trigger = $.prop($$props, 'trigger', 3, "click"),
		placement = $.prop($$props, 'placement', 3, "top"),
		offset = $.prop($$props, 'offset', 3, DEFAULT_OFFSET),
		arrow = $.prop($$props, 'arrow', 3, false),
		yOnly = $.prop($$props, 'yOnly', 3, false),
		strategy = $.prop($$props, 'strategy', 3, "absolute"),
		role = $.prop($$props, 'role', 3, "tooltip"),
		middlewares = $.prop($$props, 'middlewares', 19, () => [dom.flip(), dom.shift()]),
		className = $.prop($$props, 'class', 3, ""),
		arrowClass = $.prop($$props, 'arrowClass', 3, ""),
		isOpen = $.prop($$props, 'isOpen', 15, false),
		transition = $.prop($$props, 'transition', 3, fade),
		restProps = $.rest_props($$props, rest_excludes);

	let focusable = true;
	let clickable = $.derived(() => trigger() === "click");
	let hoverable = $.derived(() => trigger() === "hover");
	let popover = $.state(null);
	let invoker = null;
	let referenceElement = null;
	let triggerEls = [];
	let arrowParams = $.state($.proxy({ placement: "top", cords: { x: 0, y: 0 } }));

	$.user_effect(() => {
		$.set(arrowParams, { placement: placement(), cords: { x: 0, y: 0 } }, true);
	});

	$.user_effect(() => {
		if ($$props.reference && $.get(popover)) {
			referenceElement = $.get(popover).ownerDocument.querySelector($$props.reference);
		}
	});

	let arrowEl = $.state(null);

	$.user_effect(() => {
		if ($.get(popover)) {
			$.set(arrowEl, $.get(popover).querySelector(".popover-arrow"), true);
		}
	});

	let middleware = $.derived(() => {
		const base = [...middlewares(), dom.offset(offset())];

		if ($.get(arrowEl)) base.push(dom.arrow({ element: $.get(arrowEl) }));

		return base;
	});

	const paramsDefault = { duration: 100, easing: sineIn };
	const paramsOptions = $.derived(() => $$props.transitionParams ?? paramsDefault);
	const px = (n) => n ? `${n}px` : "";

	function updatePopoverPosition() {
		if (!invoker || !$.get(popover)) {
			return;
		}

		return dom.computePosition(referenceElement ?? invoker, $.get(popover), {
			placement: placement(),
			middleware: $.get(middleware),
			strategy: strategy()
		}).then(({ x, y, middlewareData: { arrow }, placement: pl, strategy }) => {
			if ($.get(popover)) {
				Object.assign($.get(popover).style, {
					position: strategy,
					left: yOnly() ? "0" : px(x),
					right: "auto",
					top: px(y)
				});

				if (arrow && $.get(arrowEl)) {
					$.set(arrowParams, { placement: pl, cords: { x: arrow.x, y: arrow.y } }, true);
				}
			}
		});
	}

	async function _open_popover(ev) {
		ev.preventDefault();

		if (ev.target !== invoker && triggerEls.includes(ev.target)) {
			invoker = ev.target;

			if (isOpen()) {
				// invoker changed but the popover is open and stays open; pretend as if it toggles
				$.get(popover)?.dispatchEvent(new ToggleEvent("beforetoggle", { newState: "open", oldState: "open" }));

				await updatePopoverPosition();
				$.get(popover)?.dispatchEvent(new ToggleEvent("toggle", { newState: "open", oldState: "open" }));
			}
		}

		if (ev.type === "mousedown") {
			isOpen(!isOpen());
		} else {
			isOpen(true);
		}
	}

	async function _close_popover(ev) {
		// For click triggers, don't close on focusout events from inside the popover
		if (trigger() === "click" && ev.type === "focusout") {
			const relatedTarget = ev.relatedTarget;

			// If focus is moving to somewhere inside the popover, don't close
			if ($.get(popover) && relatedTarget && $.get(popover).contains(relatedTarget)) {
				return;
			}

			// If focus is moving to nowhere (like when clicking), don't close for click triggers
			if (!relatedTarget) {
				return;
			}
		}

		// if popover has focus don't close when leaving the invoker
		if (ev?.type === "mouseleave" && $.get(popover)?.contains($.get(popover).ownerDocument.activeElement)) {
			return;
		}

		if (ev?.type === "focusout" && $.get(popover)?.contains($.get(popover).ownerDocument.activeElement)) {
			return;
		}

		isOpen(false);
	}

	const [open_popover, close_popover] = createMutualDebounce(_open_popover, _close_popover, () => triggerDelay());

	function on_before_toggle(ev) {
		if (!invoker || !$.get(popover)) return;

		const evWithTrigger = Object.assign(ev, { trigger: invoker });

		$$props.onbeforetoggle?.(evWithTrigger);
	}

	$.user_effect(() => {
		// Floating UI instance when it's closed we need to keep a autoUpdate destroy function
		let autoUpdateDestroy = null;

		if (isOpen() && $.get(popover) && invoker) {
			autoUpdateDestroy = dom.autoUpdate(referenceElement ?? invoker, $.get(popover), updatePopoverPosition);
			$.get(popover).ownerDocument.addEventListener("click", closeOnClickOutside);
			$.get(popover).ownerDocument.addEventListener("keydown", closeOnEscape);
		}

		return () => {
			autoUpdateDestroy?.();
			autoUpdateDestroy = null;
			$.get(popover)?.ownerDocument.removeEventListener("click", closeOnClickOutside);
			$.get(popover)?.ownerDocument.removeEventListener("keydown", closeOnEscape);
		};
	});

	function on_toggle(ev) {
		if (!invoker) return;

		// Update isOpen value when popover state changes through other means
		isOpen(ev.newState === "open");

		const evWithTrigger = Object.assign(ev, { trigger: invoker });

		$$props.ontoggle?.(evWithTrigger);

		if (ev.newState === "closed") {
			$$props.onclose?.(evWithTrigger);
		}
	}

	function set_triggers(node) {
		const events = [
			["focusin", open_popover, focusable],
			["focusout", close_popover, focusable],
			["mousedown", open_popover, $.get(clickable)],
			["mouseenter", open_popover, $.get(hoverable)],
			["mouseleave", close_popover, $.get(hoverable)]
		];

		if ($$props.triggeredBy) triggerEls = [...node.ownerDocument.querySelectorAll($$props.triggeredBy)]; else if (node.previousElementSibling) triggerEls = [node.previousElementSibling]; else if (node.parentElement) triggerEls = [node.parentElement];

		if (!triggerEls.length) {
			console.error("No triggers found.", $$props.triggeredBy);

			return;
		}

		invoker = triggerEls[0];

		triggerEls.forEach((element) => {
			if (element.tabIndex < 0) element.tabIndex = 0; // trigger must be focusable

			for (const [name, handler, cond] of events) if (cond) element.addEventListener(name, handler);
		});

		return () => {
			triggerEls.forEach((element) => {
				for (const [name, handler, cond] of events) if (cond) element.removeEventListener(name, handler);
			});
		};
	}

	function closeOnEscape(event) {
		if (event.key === "Escape") {
			isOpen(false);
		}
	}

	function closeOnClickOutside(event) {
		if (!$.get(popover)) {
			return;
		}

		const clickPath = event.composedPath();
		const isClickInsidePopover = clickPath.includes($.get(popover));
		const isClickOnTrigger = triggerEls.some((el) => clickPath.includes(el));

		// Only close if click is outside both popover and trigger elements
		if (!isClickInsidePopover && !isClickOnTrigger) {
			close_popover(event);
			isOpen(false);
		}
	}

	var fragment = root_1();
	var div = $.first_child(fragment);

	$.attach(div, () => set_triggers);

	var node_1 = $.sibling(div, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_1 = root();
			var event_handler = () => $.get(popover)?.showPopover();
			var event_handler_1 = () => $.get(popover)?.hidePopover();

			$.attribute_effect(
				div_1,
				($0) => ({
					popover: 'manual',
					role: role(),
					onfocusout: close_popover,
					onmouseleave: $.get(hoverable) ? close_popover : undefined,
					onmouseenter: $.get(hoverable) ? open_popover : undefined,
					class: $0,
					onintrostart: event_handler,
					onbeforetoggle: on_before_toggle,
					ontoggle: on_toggle,
					onoutroend: event_handler_1,
					...restProps,
					[$.CLASS]: { 'overflow-visible': true }
				}),
				[() => clsx(className())]
			);

			var node_2 = $.child(div_1);

			$.snippet(node_2, () => $$props.children);

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent = ($$anchor) => {
					Arrow($$anchor, $.spread_props(() => $.get(arrowParams), {
						get class() {
							return arrowClass();
						}
					}));
				};

				$.if(node_3, ($$render) => {
					if (arrow()) $$render(consequent);
				});
			}

			$.reset(div_1);
			$.bind_this(div_1, ($$value) => $.set(popover, $$value), () => $.get(popover));
			$.transition(3, div_1, transition, () => $.get(paramsOptions));
			$.append($$anchor, div_1);
		};

		$.if(node_1, ($$render) => {
			if (isOpen()) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}