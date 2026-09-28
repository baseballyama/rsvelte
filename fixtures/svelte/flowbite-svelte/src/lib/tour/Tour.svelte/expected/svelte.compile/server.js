import * as $ from 'svelte/internal/server';
import { tick } from "svelte";
import { computePosition, flip, shift, offset, arrow } from "@floating-ui/dom";
import { tour } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

export default function Tour($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			steps = [],
			active = false,
			currentStep = 0,
			oncomplete = () => {},
			onskip = () => {},
			showOverlay = true,
			scrollBehavior = "smooth",
			tooltipOffset = 12,
			size = "md",
			color = "primary",
			highlightClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("tour"));
		let highlightStyle = "";
		let tooltipStyle = "";
		let tooltipElement = null;
		let arrowElement = null;
		let arrowStyle = "";
		let actualPlacement = "bottom";
		let clipPathStyle = "";
		const isLastStep = $.derived(() => currentStep === steps.length - 1);
		const isFirstStep = $.derived(() => currentStep === 0);
		const currentStepData = $.derived(() => steps[currentStep]);
		const styles = $.derived(() => tour({ size, color }));

		async function updatePositions() {
			if (!active || !currentStepData()?.target || !tooltipElement) return;

			await tick();

			const target = document.querySelector(currentStepData().target);

			if (!target) {
				console.warn(`Tour: Target element "${currentStepData().target}" not found`);

				return;
			}

			// Scroll target into view
			target.scrollIntoView({ behavior: scrollBehavior, block: "center" });

			await tick();

			const rect = target.getBoundingClientRect();

			// Calculate highlight position (no padding, exact match to element)
			const highlightTop = rect.top;

			const highlightLeft = rect.left;
			const highlightWidth = rect.width;
			const highlightHeight = rect.height;

			highlightStyle = `
      top: ${highlightTop}px;
      left: ${highlightLeft}px;
      width: ${highlightWidth}px;
      height: ${highlightHeight}px;
    `;

			// Create clip-path for overlay to cut out the highlighted area
			clipPathStyle = `clip-path: polygon(
      0% 0%,
      0% 100%,
      ${highlightLeft}px 100%,
      ${highlightLeft}px ${highlightTop}px,
      ${highlightLeft + highlightWidth}px ${highlightTop}px,
      ${highlightLeft + highlightWidth}px ${highlightTop + highlightHeight}px,
      ${highlightLeft}px ${highlightTop + highlightHeight}px,
      ${highlightLeft}px 100%,
      100% 100%,
      100% 0%
    );`;

			// Calculate tooltip position using Floating UI
			const placement = currentStepData().placement || "bottom";

			const { x, y, placement: finalPlacement, middlewareData } = await computePosition(target, tooltipElement, {
				placement,
				middleware: [
					offset(tooltipOffset),
					flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
					shift({ padding: 16 }),
					...arrowElement ? [arrow({ element: arrowElement })] : []
				]
			});

			tooltipStyle = `
      left: ${x}px;
      top: ${y}px;
    `;

			actualPlacement = finalPlacement;

			// Update arrow position
			if (middlewareData.arrow && arrowElement) {
				const { x: arrowX, y: arrowY } = middlewareData.arrow;
				const staticSide = ({ top: "bottom", right: "left", bottom: "top", left: "right" })[finalPlacement.split("-")[0]];

				arrowStyle = `
        left: ${arrowX != null ? `${arrowX}px` : ""};
        top: ${arrowY != null ? `${arrowY}px` : ""};
        ${staticSide}: -4px;
      `;
			}
		}

		function next() {
			if (isLastStep()) {
				complete();
			} else {
				currentStep++;
				updatePositions();
			}
		}

		function previous() {
			if (!isFirstStep()) {
				currentStep--;
				updatePositions();
			}
		}

		function skip() {
			active = false;
			onskip();
		}

		function complete() {
			active = false;
			oncomplete();
		}

		function goToStep(index) {
			currentStep = index;
			updatePositions();
		}

		if (// Position updates - depends on active
		// Focus management - depends on active AND tooltipElement
		// Keyboard events - depends on active
		active && currentStepData()) {
			$$renderer.push('<!--[0-->');

			if (showOverlay) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`${$.stringify(styles().overlay({ class: clsx(theme()?.overlay, classes?.overlay) }))} z-[9998]`)}${$.attr_style(clipPathStyle)} role="button" tabindex="0" aria-label="Close tour"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div${$.attr_class(`${$.stringify(highlightClass
				? highlightClass
				: styles().highlight({ class: clsx(theme()?.highlight, classes?.highlight) }))} z-[9999]`)}${$.attr_style(highlightStyle)}></div> <div tabindex="-1"${$.attr_class($.clsx(clsx(styles().tooltip({ class: clsx(theme()?.tooltip, classes?.tooltip) }), "z-[10001]", className)))}${$.attr_style(tooltipStyle)}><div${$.attr_class($.clsx(styles().arrow({ class: clsx(theme()?.arrow, classes?.arrow) })))}${$.attr_style(arrowStyle)}${$.attr('data-placement', actualPlacement)}></div> <div${$.attributes({
				...restProps,
				class: $.clsx(styles().content({ class: clsx(theme()?.content, classes?.content) }))
			})}>`);

			if (currentStepData().title) {
				$$renderer.push(`<!--[0--><h3${$.attr_class($.clsx(styles().title({ class: clsx(theme()?.title, classes?.title) })))}>${$.escape(currentStepData().title)}</h3>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <p${$.attr_class($.clsx(styles().description({ class: clsx(theme()?.description, classes?.description) })))}>${$.escape(currentStepData().description)}</p> `);

			if (steps.length > 1) {
				$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(styles().progressContainer({
					class: clsx(theme()?.progressContainer, classes?.progressContainer)
				})))}><!--[-->`);

				const each_array = $.ensure_array_like(steps);

				for (let index = 0, $$length = each_array.length; index < $$length; index++) {
					let _ = each_array[index];

					$$renderer.push(`<button${$.attr_class(`${$.stringify(styles().progressDot({ class: clsx(theme()?.progressDot, classes?.progressDot) }))} ${$.stringify(index === currentStep ? styles().progressDotActive() : '')}`)}${$.attr('aria-label', `Go to step ${$.stringify(index + 1)}`)}${$.attr('aria-current', index === currentStep ? "step" : undefined)}></button>`);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div${$.attr_class($.clsx(styles().actions({ class: clsx(theme()?.actions, classes?.actions) })))}><button${$.attr_class(`${$.stringify(styles().button({ class: clsx(theme()?.button, classes?.button) }))} ${$.stringify(styles().buttonSecondary())}`)}>Skip</button> <div${$.attr_class($.clsx(styles().navigation({ class: clsx(theme()?.navigation, classes?.navigation) })))}>`);

			if (!isFirstStep()) {
				$$renderer.push(`<!--[0--><button${$.attr_class(`${$.stringify(styles().button({ class: clsx(theme()?.button, classes?.button) }))} ${$.stringify(styles().buttonSecondary())}`)}>Previous</button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <button${$.attr_class(`${$.stringify(styles().button({ class: clsx(theme()?.button, classes?.button) }))} ${$.stringify(styles().buttonPrimary())}`)}>${$.escape(isLastStep() ? "Finish" : "Next")}</button></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { active, currentStep });
	});
}