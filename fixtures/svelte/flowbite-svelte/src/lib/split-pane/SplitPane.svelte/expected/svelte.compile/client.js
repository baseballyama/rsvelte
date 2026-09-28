import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setSplitPaneContext } from "$lib/context";
import { splitpane } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

var root = $.from_html(`<div><!></div>`);

export default function SplitPane($$anchor, $$props) {
	$.push($$props, true);

	let direction = $.prop($$props, 'direction', 3, "horizontal"),
		minSize = $.prop($$props, 'minSize', 3, 100),
		responsive = $.prop($$props, 'responsive', 3, true),
		breakpoint = $.prop($$props, 'breakpoint', 3, 768),
		transitionProp = $.prop($$props, 'transition', 3, true),
		transitionDuration = $.prop($$props, 'transitionDuration', 3, 150),
		keyboardStep = $.prop($$props, 'keyboardStep', 3, 2),
		className = $.prop($$props, 'class', 3, "");

	const TOLERANCE = 0.5; // For pixel comparisons (minSize - TOLERANCE)
	const MIN_CHANGE_THRESHOLD = 0.01; // For percentage changes (size deltas)
	const MIN_DELTA = 1; // For mouse movement (Math.abs(delta) < MIN_DELTA)

	// Validate numeric props
	$.user_effect(() => {
		if (minSize() <= 0) {
			console.warn(`minSize must be positive, got ${minSize()}.`);
		}

		if (keyboardStep() <= 0) {
			console.warn(`keyboardStep must be positive, got ${keyboardStep()}.`);
		}
	});

	let transition = $.derived(transitionProp);

	$.user_effect(() => {
		// syncing local transition state with prop changes
		if (!$.get(isDragging)) {
			$.set(transition, transitionProp());
		}
	});

	const theme = $.derived(() => getTheme("splitpane"));
	let isDragging = $.state(false);
	let startPos = $.state(0);
	let sizes = $.state($.proxy([]));
	let container;
	let currentDirection = $.derived(direction);
	let registeredPanes = $.state(0);

	// Register panes as they mount
	function registerPane() {
		const index = $.get(registeredPanes);

		$.update(registeredPanes);

		return index;
	}

	function getPaneStyle(index) {
		if ($.get(sizes)[index] === undefined) return "";

		const size = `${$.get(sizes)[index]}%`;

		const transitionStyle = $.get(transition)
			? `${$.get(currentDirection) === "horizontal" ? "width" : "height"} ${transitionDuration()}ms ease`
			: "none";

		if ($.get(currentDirection) === "horizontal") {
			return `width: ${size}; height: 100%; transition: ${transitionStyle};`;
		} else {
			return `height: ${size}; width: 100%; transition: ${transitionStyle};`;
		}
	}

	function shouldRenderDivider(paneIndex) {
		return paneIndex < $.get(registeredPanes) - 1;
	}

	// Set context for child Pane components
	setSplitPaneContext({
		registerPane,
		getPaneStyle,
		getPaneSize: (index) => $.get(sizes)[index] ?? ($.get(registeredPanes) > 0 ? 100 / $.get(registeredPanes) : 0),
		shouldRenderDivider,
		getDirection: () => $.get(currentDirection),
		getIsDragging: () => $.get(isDragging),
		onMouseDown: startResize,
		onTouchStart: startTouchResize,
		onKeyDown: handleKeyResize
	});

	let containerSize = $.state(0);

	// Track container size changes
	$.user_effect(() => {
		if (!container) return;

		const updateSize = () => {
			$.set(containerSize, $.get(currentDirection) === "horizontal" ? container.offsetWidth : container.offsetHeight, true);
		};

		updateSize();

		const resizeObserver = new ResizeObserver(updateSize);

		resizeObserver.observe(container);

		return () => resizeObserver.disconnect();
	});

	// Initialize and maintain sizes
	$.user_effect(() => {
		if ($.get(registeredPanes) === 0) {
			$.set(sizes, [], true);

			return;
		}

		// If container not ready yet, use equal distribution
		if ($.get(containerSize) < 1) {
			if ($.get(sizes).length !== $.get(registeredPanes)) {
				const equal = 100 / $.get(registeredPanes);

				$.set(sizes, Array.from({ length: $.get(registeredPanes) }, () => equal), true);
			}

			return;
		}

		const minPercent = minSize() / $.get(containerSize) * 100;

		// Check if minSize is achievable for all panes
		const totalMinRequired = minPercent * $.get(registeredPanes);

		if (totalMinRequired > 100) {
			console.error(`Cannot satisfy minSize=${minSize()}px for ${$.get(registeredPanes)} panes in ${$.get(containerSize)}px container. ` + `Required: ${(minSize() * $.get(registeredPanes)).toFixed(0)}px. Using equal distribution.`);

			const equal = 100 / $.get(registeredPanes);

			$.set(sizes, Array.from({ length: $.get(registeredPanes) }, () => equal), true);

			return;
		}

		// Check if current sizes violate minSize constraints
		const currentPixelSizes = $.get(sizes).map((s) => s / 100 * $.get(containerSize));

		const violatesMinSize = currentPixelSizes.some((pixelSize) => pixelSize < minSize() - TOLERANCE); // small tolerance

		if (violatesMinSize) {
			// Recalculate sizes to respect minSize
			let newSizes = $.get(sizes).map((s) => Math.max(s / 100 * $.get(containerSize), minSize()));

			const totalPixels = newSizes.reduce((a, b) => a + b, 0);

			// Convert back to percentages
			if (totalPixels > $.get(containerSize)) {
				// If we can't fit all panes at minSize, distribute proportionally
				newSizes = newSizes.map((s) => s / totalPixels * $.get(containerSize));
			}

			$.set(sizes, newSizes.map((pixelSize) => pixelSize / $.get(containerSize) * 100), true);
		}

		// Handle initialSizes (only on first initialization)
		if ($$props.initialSizes && $$props.initialSizes.length === $.get(registeredPanes) && $.get(sizes).length !== $.get(registeredPanes)) {
			const hasInvalidValues = $$props.initialSizes.some((s) => s < 0 || !isFinite(s));

			if (hasInvalidValues) {
				console.warn("initialSizes contains invalid values. Using equal distribution.");

				const equal = Math.max(100 / $.get(registeredPanes), minPercent);

				$.set(sizes, Array.from({ length: $.get(registeredPanes) }, () => equal), true);

				return;
			}

			const sum = $$props.initialSizes.reduce((a, b) => a + b, 0);

			if (sum <= 0 || sum < 0.01) {
				console.warn("initialSizes sum to zero. Using equal distribution.");

				const equal = Math.max(100 / $.get(registeredPanes), minPercent);

				$.set(sizes, Array.from({ length: $.get(registeredPanes) }, () => equal), true);

				return;
			}

			let normalizedSizes = $$props.initialSizes.map((s) => s / sum * 100);
			const violatesConstraints = normalizedSizes.some((size) => size < minPercent);

			if (violatesConstraints) {
				console.warn(`initialSizes [${normalizedSizes.map((s) => s.toFixed(1)).join("%, ")}%] ` + `violate minSize constraint (${minSize()}px = ${minPercent.toFixed(1)}%). ` + `Adjusting to respect minimum constraints.`);
				normalizedSizes = normalizedSizes.map((size) => Math.max(size, minPercent));

				const newSum = normalizedSizes.reduce((a, b) => a + b, 0);

				normalizedSizes = normalizedSizes.map((size) => size / newSum * 100);
			}

			$.set(sizes, normalizedSizes, true);

			return;
		}

		// Default: equal distribution respecting minSize
		if ($.get(sizes).length !== $.get(registeredPanes)) {
			const equal = Math.max(100 / $.get(registeredPanes), minPercent);

			$.set(sizes, Array.from({ length: $.get(registeredPanes) }, () => equal), true);
		}
	});

	// Responsive direction handling
	$.user_effect(() => {
		if (!responsive()) {
			$.set(currentDirection, direction());

			return;
		}

		if (typeof window === "undefined") {
			$.set(currentDirection, direction());

			return;
		}

		const mq = window.matchMedia(`(max-width: ${breakpoint()}px)`);

		const handleResize = () => {
			// deferring the direction switch until the drag completes
			if (!$.get(isDragging)) {
				$.set(currentDirection, mq.matches ? "vertical" : "horizontal");
			}
		};

		handleResize();
		mq.addEventListener("change", handleResize);

		return () => mq.removeEventListener("change", handleResize);
	});

	// Notify parent of size changes
	$.user_effect(() => {
		if ($.get(sizes).length > 0 && $$props.onResize) {
			$$props.onResize($.get(sizes));
		}
	});

	function startResize(e, index) {
		e.preventDefault();
		$.set(isDragging, true);
		$.set(transition, false);
		$.set(startPos, $.get(currentDirection) === "horizontal" ? e.clientX : e.clientY, true);

		const moveHandler = (ev) => resize(ev, index);
		const upHandler = () => stopResize(moveHandler, upHandler);

		window.addEventListener("mousemove", moveHandler);
		window.addEventListener("mouseup", upHandler);
		document.body.style.cursor = $.get(currentDirection) === "horizontal" ? "col-resize" : "row-resize";
		document.body.style.userSelect = "none";
	}

	function stopResize(moveHandler, upHandler) {
		$.set(isDragging, false);
		$.set(transition, transitionProp());
		window.removeEventListener("mousemove", moveHandler);
		window.removeEventListener("mouseup", upHandler);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}

	function startTouchResize(e, index) {
		e.preventDefault();
		$.set(isDragging, true);
		$.set(transition, false);

		const touch = e.touches[0];

		$.set(startPos, $.get(currentDirection) === "horizontal" ? touch.clientX : touch.clientY, true);

		const moveHandler = (ev) => resizeTouch(ev, index);
		const endHandler = () => stopTouchResize(moveHandler, endHandler);

		window.addEventListener("touchmove", moveHandler, { passive: false });
		window.addEventListener("touchend", endHandler);
		window.addEventListener("touchcancel", endHandler);
		document.body.style.userSelect = "none";
	}

	function stopTouchResize(moveHandler, endHandler) {
		$.set(isDragging, false);
		$.set(transition, transitionProp());
		window.removeEventListener("touchmove", moveHandler);
		window.removeEventListener("touchend", endHandler);
		window.removeEventListener("touchcancel", endHandler);
		document.body.style.userSelect = "";
	}

	function clampPaneSizes(index, targetSize, minPercent, total) {
		if (index < 0 || index + 1 >= $.get(sizes).length) return false;

		let newSize1 = Math.min(total - minPercent, Math.max(minPercent, targetSize));
		let newSize2 = total - newSize1;

		if (newSize2 < minPercent) {
			newSize2 = minPercent;
			newSize1 = total - newSize2;
		}

		if (Math.abs(newSize1 - $.get(sizes)[index]) > MIN_CHANGE_THRESHOLD) {
			$.get(sizes)[index] = newSize1;
			$.get(sizes)[index + 1] = newSize2;

			return true;
		}

		return false;
	}

	function applyResize(currentPos, index) {
		if (!$.get(isDragging) || !container) return;
		if (index < 0 || index + 1 >= $.get(sizes).length) return;

		const delta = currentPos - $.get(startPos);

		if (Math.abs(delta) < MIN_DELTA) return;

		const currentContainerSize = $.get(currentDirection) === "horizontal" ? container.offsetWidth : container.offsetHeight;

		if (currentContainerSize < 1) return;

		const deltaPercent = delta / currentContainerSize * 100;
		const minPercent = minSize() / currentContainerSize * 100;
		const oldSize1 = $.get(sizes)[index];
		const oldSize2 = $.get(sizes)[index + 1];
		const totalSize = oldSize1 + oldSize2;
		const targetSize = oldSize1 + deltaPercent;

		if (clampPaneSizes(index, targetSize, minPercent, totalSize)) {
			$.set(startPos, currentPos, true);
		}
	}

	function handleKeyResize(e, index) {
		if (!container) return;
		if (index < 0 || index + 1 >= $.get(sizes).length) return;

		const isHorizontal = $.get(currentDirection) === "horizontal";
		const increaseKeys = isHorizontal ? ["ArrowRight"] : ["ArrowDown"];
		const decreaseKeys = isHorizontal ? ["ArrowLeft"] : ["ArrowUp"];
		const containerSize = isHorizontal ? container.offsetWidth : container.offsetHeight;

		if (containerSize < 1) return;

		const minPercent = minSize() / containerSize * 100;
		const total = $.get(sizes)[index] + $.get(sizes)[index + 1];
		let handled = false;

		if (increaseKeys.includes(e.key)) {
			const targetSize = $.get(sizes)[index] + keyboardStep();

			handled = clampPaneSizes(index, targetSize, minPercent, total);
		} else if (decreaseKeys.includes(e.key)) {
			const targetSize = $.get(sizes)[index] - keyboardStep();

			handled = clampPaneSizes(index, targetSize, minPercent, total);
		} else if (e.key === "Enter" || e.key === " ") {
			// Reset to equal sizes
			const equal = 100 / $.get(registeredPanes);

			$.set(sizes, $.get(sizes).map(() => equal), true);
			handled = true;
		}

		if (handled) {
			e.preventDefault();
		}
	}

	function resize(e, index) {
		const currentPos = $.get(currentDirection) === "horizontal" ? e.clientX : e.clientY;

		applyResize(currentPos, index);
	}

	function resizeTouch(e, index) {
		e.preventDefault(); // Prevent scrolling while dragging

		const touch = e.touches[0];
		const currentPos = $.get(currentDirection) === "horizontal" ? touch.clientX : touch.clientY;

		applyResize(currentPos, index);
	}

	var div = root();
	var node = $.child(div);

	$.snippet(node, () => $$props.children);
	$.reset(div);
	$.bind_this(div, ($$value) => container = $$value, () => container);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(splitpane({
			direction: $.get(currentDirection),
			class: clsx($.get(theme), className())
		}))
	]);

	$.append($$anchor, div);
	$.pop();
}