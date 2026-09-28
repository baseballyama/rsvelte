import * as $ from 'svelte/internal/server';
import * as dom from "@floating-ui/dom";
import clsx from "clsx";
import { sineIn } from "svelte/easing";
import { fade } from "svelte/transition";
import Arrow from "./Arrow.svelte";
import { createMutualDebounce } from "./debounce";

export default function Popper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const DEFAULT_TRIGGER_DELAY = 200;
		const DEFAULT_OFFSET = 8;

		let {
			triggeredBy,
			triggerDelay = DEFAULT_TRIGGER_DELAY,
			trigger = "click",
			placement = "top",
			offset = DEFAULT_OFFSET,
			arrow = false,
			yOnly = false,
			strategy = "absolute",
			role = "tooltip",
			reference,
			middlewares = [dom.flip(), dom.shift()],
			class: className = "",
			arrowClass = "",
			isOpen = false,
			transitionParams,
			transition = fade,
			onbeforetoggle,
			ontoggle,
			onclose,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let focusable = true;
		let clickable = $.derived(() => trigger === "click");
		let hoverable = $.derived(() => trigger === "hover");
		let popover = null;
		let invoker = null;
		let referenceElement = null;
		let triggerEls = [];
		let arrowParams = { placement: "top", cords: { x: 0, y: 0 } };
		let arrowEl = null;

		let middleware = $.derived(() => {
			const base = [...middlewares, dom.offset(offset)];

			if (arrowEl) base.push(dom.arrow({ element: arrowEl }));

			return base;
		});

		const paramsDefault = { duration: 100, easing: sineIn };
		const paramsOptions = $.derived(() => transitionParams ?? paramsDefault);
		const px = (n) => n ? `${n}px` : "";

		function updatePopoverPosition() {
			if (!invoker || !popover) {
				return;
			}

			return dom.computePosition(referenceElement ?? invoker, popover, { placement, middleware: middleware(), strategy }).then(({ x, y, middlewareData: { arrow }, placement: pl, strategy }) => {
				if (popover) {
					Object.assign(popover.style, {
						position: strategy,
						left: yOnly ? "0" : px(x),
						right: "auto",
						top: px(y)
					});

					if (arrow && arrowEl) {
						arrowParams = { placement: pl, cords: { x: arrow.x, y: arrow.y } };
					}
				}
			});
		}

		async function _open_popover(ev) {
			ev.preventDefault();

			if (ev.target !== invoker && triggerEls.includes(ev.target)) {
				invoker = ev.target;

				if (isOpen) {
					// invoker changed but the popover is open and stays open; pretend as if it toggles
					popover?.dispatchEvent(new ToggleEvent("beforetoggle", { newState: "open", oldState: "open" }));

					await updatePopoverPosition();
					popover?.dispatchEvent(new ToggleEvent("toggle", { newState: "open", oldState: "open" }));
				}
			}

			if (ev.type === "mousedown") {
				isOpen = !isOpen;
			} else {
				isOpen = true;
			}
		}

		async function _close_popover(ev) {
			// For click triggers, don't close on focusout events from inside the popover
			if (trigger === "click" && ev.type === "focusout") {
				const relatedTarget = ev.relatedTarget;

				// If focus is moving to somewhere inside the popover, don't close
				if (popover && relatedTarget && popover.contains(relatedTarget)) {
					return;
				}

				// If focus is moving to nowhere (like when clicking), don't close for click triggers
				if (!relatedTarget) {
					return;
				}
			}

			// if popover has focus don't close when leaving the invoker
			if (ev?.type === "mouseleave" && popover?.contains(popover.ownerDocument.activeElement)) {
				return;
			}

			if (ev?.type === "focusout" && popover?.contains(popover.ownerDocument.activeElement)) {
				return;
			}

			isOpen = false;
		}

		const [open_popover, close_popover] = createMutualDebounce(_open_popover, _close_popover, () => triggerDelay);

		function on_before_toggle(ev) {
			if (!invoker || !popover) return;

			const evWithTrigger = Object.assign(ev, { trigger: invoker });

			onbeforetoggle?.(evWithTrigger);
		}

		// Floating UI instance when it's closed we need to keep a autoUpdate destroy function
		function on_toggle(ev) {
			if (!invoker) return;

			// Update isOpen value when popover state changes through other means
			isOpen = ev.newState === "open";

			const evWithTrigger = Object.assign(ev, { trigger: invoker });

			ontoggle?.(evWithTrigger);

			if (ev.newState === "closed") {
				onclose?.(evWithTrigger);
			}
		}

		function set_triggers(node) {
			const events = [
				["focusin", open_popover, focusable],
				["focusout", close_popover, focusable],
				["mousedown", open_popover, clickable()],
				["mouseenter", open_popover, hoverable()],
				["mouseleave", close_popover, hoverable()]
			];

			if (triggeredBy) triggerEls = [...node.ownerDocument.querySelectorAll(triggeredBy)]; else if (node.previousElementSibling) triggerEls = [node.previousElementSibling]; else if (node.parentElement) triggerEls = [node.parentElement];

			if (!triggerEls.length) {
				console.error("No triggers found.", triggeredBy);

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
				isOpen = false;
			}
		}

		function closeOnClickOutside(event) {
			if (!popover) {
				return;
			}

			const clickPath = event.composedPath();
			const isClickInsidePopover = clickPath.includes(popover);
			const isClickOnTrigger = triggerEls.some((el) => clickPath.includes(el));

			// Only close if click is outside both popover and trigger elements
			if (!isClickInsidePopover && !isClickOnTrigger) {
				close_popover(event);
				isOpen = false;
			}
		}

		$$renderer.push(`<div hidden=""></div> `);

		if (isOpen) {
			$$renderer.push(`<!--[0--><div${$.attributes(
				{
					popover: 'manual',
					role,
					class: $.clsx(clsx(className)),
					...restProps
				},
				void 0,
				{ 'overflow-visible': true }
			)}>`);

			children($$renderer);
			$$renderer.push(`<!----> `);

			if (arrow) {
				$$renderer.push('<!--[0-->');
				Arrow($$renderer, $.spread_props([arrowParams, { class: arrowClass }]));
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { isOpen });
	});
}