import * as $ from 'svelte/internal/server';
import { setSplitPaneContext } from "$lib/context";
import { splitpane } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

export default function SplitPane($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			direction = "horizontal",
			minSize = 100,
			responsive = true,
			breakpoint = 768,
			transition: transitionProp = true,
			transitionDuration = 150,
			keyboardStep = 2,
			initialSizes,
			onResize,
			children,
			class: className = ""
		} = $$props;

		const TOLERANCE = 0.5; // For pixel comparisons (minSize - TOLERANCE)
		const MIN_CHANGE_THRESHOLD = 0.01; // For percentage changes (size deltas)
		const MIN_DELTA = 1; // For mouse movement (Math.abs(delta) < MIN_DELTA)

		// Validate numeric props
		let transition = $.derived(() => transitionProp);

		// syncing local transition state with prop changes
		const theme = $.derived(() => getTheme("splitpane"));

		let isDragging = false;
		let startPos = 0;
		let sizes = [];
		let container;
		let currentDirection = $.derived(() => direction);
		let registeredPanes = 0;

		// Register panes as they mount
		function registerPane() {
			const index = registeredPanes;

			registeredPanes++;

			return index;
		}

		function getPaneStyle(index) {
			if (sizes[index] === undefined) return "";

			const size = `${sizes[index]}%`;

			const transitionStyle = transition()
				? `${currentDirection() === "horizontal" ? "width" : "height"} ${transitionDuration}ms ease`
				: "none";

			if (currentDirection() === "horizontal") {
				return `width: ${size}; height: 100%; transition: ${transitionStyle};`;
			} else {
				return `height: ${size}; width: 100%; transition: ${transitionStyle};`;
			}
		}

		function shouldRenderDivider(paneIndex) {
			return paneIndex < registeredPanes - 1;
		}

		// Set context for child Pane components
		setSplitPaneContext({
			registerPane,
			getPaneStyle,
			getPaneSize: (index) => sizes[index] ?? (registeredPanes > 0 ? 100 / registeredPanes : 0),
			shouldRenderDivider,
			getDirection: () => currentDirection(),
			getIsDragging: () => isDragging,
			onMouseDown: startResize,
			onTouchStart: startTouchResize,
			onKeyDown: handleKeyResize
		});

		let containerSize = 0;

		// Track container size changes
		// Initialize and maintain sizes
		// If container not ready yet, use equal distribution
		// Check if minSize is achievable for all panes
		// Check if current sizes violate minSize constraints
		// small tolerance
		// Recalculate sizes to respect minSize
		// Convert back to percentages
		// If we can't fit all panes at minSize, distribute proportionally
		// Handle initialSizes (only on first initialization)
		// Default: equal distribution respecting minSize
		// Responsive direction handling
		// deferring the direction switch until the drag completes
		// Notify parent of size changes
		function startResize(e, index) {
			e.preventDefault();
			isDragging = true;
			transition(false);
			startPos = currentDirection() === "horizontal" ? e.clientX : e.clientY;

			const moveHandler = (ev) => resize(ev, index);
			const upHandler = () => stopResize(moveHandler, upHandler);

			window.addEventListener("mousemove", moveHandler);
			window.addEventListener("mouseup", upHandler);
			document.body.style.cursor = currentDirection() === "horizontal" ? "col-resize" : "row-resize";
			document.body.style.userSelect = "none";
		}

		function stopResize(moveHandler, upHandler) {
			isDragging = false;
			transition(transitionProp);
			window.removeEventListener("mousemove", moveHandler);
			window.removeEventListener("mouseup", upHandler);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		}

		function startTouchResize(e, index) {
			e.preventDefault();
			isDragging = true;
			transition(false);

			const touch = e.touches[0];

			startPos = currentDirection() === "horizontal" ? touch.clientX : touch.clientY;

			const moveHandler = (ev) => resizeTouch(ev, index);
			const endHandler = () => stopTouchResize(moveHandler, endHandler);

			window.addEventListener("touchmove", moveHandler, { passive: false });
			window.addEventListener("touchend", endHandler);
			window.addEventListener("touchcancel", endHandler);
			document.body.style.userSelect = "none";
		}

		function stopTouchResize(moveHandler, endHandler) {
			isDragging = false;
			transition(transitionProp);
			window.removeEventListener("touchmove", moveHandler);
			window.removeEventListener("touchend", endHandler);
			window.removeEventListener("touchcancel", endHandler);
			document.body.style.userSelect = "";
		}

		function clampPaneSizes(index, targetSize, minPercent, total) {
			if (index < 0 || index + 1 >= sizes.length) return false;

			let newSize1 = Math.min(total - minPercent, Math.max(minPercent, targetSize));
			let newSize2 = total - newSize1;

			if (newSize2 < minPercent) {
				newSize2 = minPercent;
				newSize1 = total - newSize2;
			}

			if (Math.abs(newSize1 - sizes[index]) > MIN_CHANGE_THRESHOLD) {
				sizes[index] = newSize1;
				sizes[index + 1] = newSize2;

				return true;
			}

			return false;
		}

		function applyResize(currentPos, index) {
			if (!isDragging || !container) return;
			if (index < 0 || index + 1 >= sizes.length) return;

			const delta = currentPos - startPos;

			if (Math.abs(delta) < MIN_DELTA) return;

			const currentContainerSize = currentDirection() === "horizontal" ? container.offsetWidth : container.offsetHeight;

			if (currentContainerSize < 1) return;

			const deltaPercent = delta / currentContainerSize * 100;
			const minPercent = minSize / currentContainerSize * 100;
			const oldSize1 = sizes[index];
			const oldSize2 = sizes[index + 1];
			const totalSize = oldSize1 + oldSize2;
			const targetSize = oldSize1 + deltaPercent;

			if (clampPaneSizes(index, targetSize, minPercent, totalSize)) {
				startPos = currentPos;
			}
		}

		function handleKeyResize(e, index) {
			if (!container) return;
			if (index < 0 || index + 1 >= sizes.length) return;

			const isHorizontal = currentDirection() === "horizontal";
			const increaseKeys = isHorizontal ? ["ArrowRight"] : ["ArrowDown"];
			const decreaseKeys = isHorizontal ? ["ArrowLeft"] : ["ArrowUp"];
			const containerSize = isHorizontal ? container.offsetWidth : container.offsetHeight;

			if (containerSize < 1) return;

			const minPercent = minSize / containerSize * 100;
			const total = sizes[index] + sizes[index + 1];
			let handled = false;

			if (increaseKeys.includes(e.key)) {
				const targetSize = sizes[index] + keyboardStep;

				handled = clampPaneSizes(index, targetSize, minPercent, total);
			} else if (decreaseKeys.includes(e.key)) {
				const targetSize = sizes[index] - keyboardStep;

				handled = clampPaneSizes(index, targetSize, minPercent, total);
			} else if (e.key === "Enter" || e.key === " ") {
				// Reset to equal sizes
				const equal = 100 / registeredPanes;

				sizes = sizes.map(() => equal);
				handled = true;
			}

			if (handled) {
				e.preventDefault();
			}
		}

		function resize(e, index) {
			const currentPos = currentDirection() === "horizontal" ? e.clientX : e.clientY;

			applyResize(currentPos, index);
		}

		function resizeTouch(e, index) {
			e.preventDefault(); // Prevent scrolling while dragging

			const touch = e.touches[0];
			const currentPos = currentDirection() === "horizontal" ? touch.clientX : touch.clientY;

			applyResize(currentPos, index);
		}

		$$renderer.push(`<div${$.attr_class($.clsx(splitpane({
			direction: currentDirection(),
			class: clsx(theme(), className)
		})))}>`);

		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}