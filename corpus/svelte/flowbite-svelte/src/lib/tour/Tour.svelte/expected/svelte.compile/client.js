import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { tick } from "svelte";
import { computePosition, flip, shift, offset, arrow } from "@floating-ui/dom";
import { tour } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'steps',
	'active',
	'currentStep',
	'oncomplete',
	'onskip',
	'showOverlay',
	'scrollBehavior',
	'tooltipOffset',
	'size',
	'color',
	'highlightClass',
	'class',
	'classes'
]);

var root = $.from_html(`<div role="button" tabindex="0" aria-label="Close tour"></div>`);
var root_1 = $.from_html(`<h3> </h3>`);
var root_2 = $.from_html(`<button></button>`);
var root_3 = $.from_html(`<div></div>`);
var root_4 = $.from_html(`<button>Previous</button>`);
var root_5 = $.from_html(`<!> <div></div> <div tabindex="-1"><div></div> <div><!> <p> </p> <!></div> <div><button>Skip</button> <div><!> <button> </button></div></div></div>`, 1);

export default function Tour($$anchor, $$props) {
	$.push($$props, true);

	let steps = $.prop($$props, 'steps', 19, () => []),
		active = $.prop($$props, 'active', 15, false),
		currentStep = $.prop($$props, 'currentStep', 15, 0),
		oncomplete = $.prop($$props, 'oncomplete', 3, () => {}),
		onskip = $.prop($$props, 'onskip', 3, () => {}),
		showOverlay = $.prop($$props, 'showOverlay', 3, true),
		scrollBehavior = $.prop($$props, 'scrollBehavior', 3, "smooth"),
		tooltipOffset = $.prop($$props, 'tooltipOffset', 3, 12),
		size = $.prop($$props, 'size', 3, "md"),
		color = $.prop($$props, 'color', 3, "primary"),
		restProps = $.rest_props($$props, rest_excludes);

	const theme = $.derived(() => getTheme("tour"));
	let highlightStyle = $.state("");
	let tooltipStyle = $.state("");
	let tooltipElement = $.state(null);
	let arrowElement = $.state(null);
	let arrowStyle = $.state("");
	let actualPlacement = $.state("bottom");
	let clipPathStyle = $.state("");
	const isLastStep = $.derived(() => currentStep() === steps().length - 1);
	const isFirstStep = $.derived(() => currentStep() === 0);
	const currentStepData = $.derived(() => steps()[currentStep()]);
	const styles = $.derived(() => tour({ size: size(), color: color() }));

	async function updatePositions() {
		if (!active() || !$.get(currentStepData)?.target || !$.get(tooltipElement)) return;

		await tick();

		const target = document.querySelector($.get(currentStepData).target);

		if (!target) {
			console.warn(`Tour: Target element "${$.get(currentStepData).target}" not found`);

			return;
		}

		// Scroll target into view
		target.scrollIntoView({ behavior: scrollBehavior(), block: "center" });

		await tick();

		const rect = target.getBoundingClientRect();

		// Calculate highlight position (no padding, exact match to element)
		const highlightTop = rect.top;

		const highlightLeft = rect.left;
		const highlightWidth = rect.width;
		const highlightHeight = rect.height;

		$.set(highlightStyle, `
      top: ${highlightTop}px;
      left: ${highlightLeft}px;
      width: ${highlightWidth}px;
      height: ${highlightHeight}px;
    `);

		// Create clip-path for overlay to cut out the highlighted area
		$.set(clipPathStyle, `clip-path: polygon(
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
    );`);

		// Calculate tooltip position using Floating UI
		const placement = $.get(currentStepData).placement || "bottom";

		const { x, y, placement: finalPlacement, middlewareData } = await computePosition(target, $.get(tooltipElement), {
			placement,
			middleware: [
				offset(tooltipOffset()),
				flip({ fallbackPlacements: ["top", "bottom", "left", "right"] }),
				shift({ padding: 16 }),
				...$.get(arrowElement) ? [arrow({ element: $.get(arrowElement) })] : []
			]
		});

		$.set(tooltipStyle, `
      left: ${x}px;
      top: ${y}px;
    `);

		$.set(actualPlacement, finalPlacement, true);

		// Update arrow position
		if (middlewareData.arrow && $.get(arrowElement)) {
			const { x: arrowX, y: arrowY } = middlewareData.arrow;
			const staticSide = ({ top: "bottom", right: "left", bottom: "top", left: "right" })[finalPlacement.split("-")[0]];

			$.set(arrowStyle, `
        left: ${arrowX != null ? `${arrowX}px` : ""};
        top: ${arrowY != null ? `${arrowY}px` : ""};
        ${staticSide}: -4px;
      `);
		}
	}

	function next() {
		if ($.get(isLastStep)) {
			complete();
		} else {
			$.update_prop(currentStep);
			updatePositions();
		}
	}

	function previous() {
		if (!$.get(isFirstStep)) {
			$.update_prop(currentStep, -1);
			updatePositions();
		}
	}

	function skip() {
		active(false);
		onskip()();
	}

	function complete() {
		active(false);
		oncomplete()();
	}

	function goToStep(index) {
		currentStep(index);
		updatePositions();
	}

	// Position updates - depends on active
	$.user_effect(() => {
		if (active()) {
			updatePositions();
			window.addEventListener("resize", updatePositions);
			window.addEventListener("scroll", updatePositions, true);

			return () => {
				window.removeEventListener("resize", updatePositions);
				window.removeEventListener("scroll", updatePositions, true);
			};
		}
	});

	// Focus management - depends on active AND tooltipElement
	$.user_effect(() => {
		if (active() && $.get(tooltipElement)) {
			$.get(tooltipElement).focus();
		}
	});

	// Keyboard events - depends on active
	$.user_effect(() => {
		if (active()) {
			const handleKeydown = (e) => {
				switch (e.key) {
					case "Escape":
						skip();
						break;

					case "ArrowRight":

					case "ArrowDown":
						e.preventDefault();
						next();
						break;

					case "ArrowLeft":

					case "ArrowUp":
						e.preventDefault();
						if (!$.get(isFirstStep)) previous();
						break;
				}
			};

			window.addEventListener("keydown", handleKeydown);

			return () => window.removeEventListener("keydown", handleKeydown);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_5();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();

					$.template_effect(
						($0) => {
							$.set_class(div, 1, `${$0 ?? ''} z-[9998]`);
							$.set_style(div, $.get(clipPathStyle));
						},
						[
							() => $.get(styles).overlay({ class: clsx($.get(theme)?.overlay, $$props.classes?.overlay) })
						]
					);

					$.delegated('click', div, skip);
					$.delegated('keydown', div, (e) => e.key === "Escape" && skip());
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if (showOverlay()) $$render(consequent);
				});
			}

			var div_1 = $.sibling(node_1, 2);
			var div_2 = $.sibling(div_1, 2);
			var div_3 = $.child(div_2);

			$.bind_this(div_3, ($$value) => $.set(arrowElement, $$value), () => $.get(arrowElement));

			var div_4 = $.sibling(div_3, 2);

			$.attribute_effect(div_4, ($0) => ({ ...restProps, class: $0 }), [
				() => $.get(styles).content({ class: clsx($.get(theme)?.content, $$props.classes?.content) })
			]);

			var node_2 = $.child(div_4);

			{
				var consequent_1 = ($$anchor) => {
					var h3 = root_1();
					var text = $.only_child(h3, true);

					$.template_effect(
						($0) => {
							$.set_class(h3, 1, $0);
							$.set_text(text, $.get(currentStepData).title);
						},
						[
							() => $.clsx($.get(styles).title({ class: clsx($.get(theme)?.title, $$props.classes?.title) }))
						]
					);

					$.append($$anchor, h3);
				};

				$.if(node_2, ($$render) => {
					if ($.get(currentStepData).title) $$render(consequent_1);
				});
			}

			var p = $.sibling(node_2, 2);
			var text_1 = $.only_child(p, true);
			var node_3 = $.sibling(p, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_5 = root_3();

					$.each(div_5, 21, steps, $.index, ($$anchor, _, index) => {
						var button = root_2();

						$.set_attribute(button, 'aria-label', `Go to step ${index + 1}`);

						$.template_effect(
							($0, $1) => {
								$.set_class(button, 1, `${$0 ?? ''} ${$1 ?? ''}`);
								$.set_attribute(button, 'aria-current', index === currentStep() ? "step" : undefined);
							},
							[
								() => $.get(styles).progressDot({
									class: clsx($.get(theme)?.progressDot, $$props.classes?.progressDot)
								}),
								() => index === currentStep() ? $.get(styles).progressDotActive() : ''
							]
						);

						$.delegated('click', button, () => goToStep(index));
						$.append($$anchor, button);
					});

					$.reset(div_5);

					$.template_effect(($0) => $.set_class(div_5, 1, $0), [
						() => $.clsx($.get(styles).progressContainer({
							class: clsx($.get(theme)?.progressContainer, $$props.classes?.progressContainer)
						}))
					]);

					$.append($$anchor, div_5);
				};

				$.if(node_3, ($$render) => {
					if (steps().length > 1) $$render(consequent_2);
				});
			}

			$.reset(div_4);

			var div_6 = $.sibling(div_4, 2);
			var button_1 = $.child(div_6);
			var div_7 = $.sibling(button_1, 2);
			var node_4 = $.child(div_7);

			{
				var consequent_3 = ($$anchor) => {
					var button_2 = root_4();

					$.template_effect(($0, $1) => $.set_class(button_2, 1, `${$0 ?? ''} ${$1 ?? ''}`), [
						() => $.get(styles).button({ class: clsx($.get(theme)?.button, $$props.classes?.button) }),
						() => $.get(styles).buttonSecondary()
					]);

					$.delegated('click', button_2, previous);
					$.append($$anchor, button_2);
				};

				$.if(node_4, ($$render) => {
					if (!$.get(isFirstStep)) $$render(consequent_3);
				});
			}

			var button_3 = $.sibling(node_4, 2);
			var text_2 = $.only_child(button_3, true);

			$.reset(div_7);
			$.reset(div_6);
			$.reset(div_2);
			$.bind_this(div_2, ($$value) => $.set(tooltipElement, $$value), () => $.get(tooltipElement));

			$.template_effect(
				($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) => {
					$.set_class(div_1, 1, `${$0 ?? ''} z-[9999]`);
					$.set_style(div_1, $.get(highlightStyle));
					$.set_class(div_2, 1, $1);
					$.set_style(div_2, $.get(tooltipStyle));
					$.set_class(div_3, 1, $2);
					$.set_style(div_3, $.get(arrowStyle));
					$.set_attribute(div_3, 'data-placement', $.get(actualPlacement));
					$.set_class(p, 1, $3);
					$.set_text(text_1, $.get(currentStepData).description);
					$.set_class(div_6, 1, $4);
					$.set_class(button_1, 1, `${$5 ?? ''} ${$6 ?? ''}`);
					$.set_class(div_7, 1, $7);
					$.set_class(button_3, 1, `${$8 ?? ''} ${$9 ?? ''}`);
					$.set_text(text_2, $.get(isLastStep) ? "Finish" : "Next");
				},
				[
					() => $$props.highlightClass
						? $$props.highlightClass
						: $.get(styles).highlight({
							class: clsx($.get(theme)?.highlight, $$props.classes?.highlight)
						}),
					() => $.clsx(clsx($.get(styles).tooltip({ class: clsx($.get(theme)?.tooltip, $$props.classes?.tooltip) }), "z-[10001]", $$props.class)),
					() => $.clsx($.get(styles).arrow({ class: clsx($.get(theme)?.arrow, $$props.classes?.arrow) })),
					() => $.clsx($.get(styles).description({
						class: clsx($.get(theme)?.description, $$props.classes?.description)
					})),
					() => $.clsx($.get(styles).actions({ class: clsx($.get(theme)?.actions, $$props.classes?.actions) })),
					() => $.get(styles).button({ class: clsx($.get(theme)?.button, $$props.classes?.button) }),
					() => $.get(styles).buttonSecondary(),
					() => $.clsx($.get(styles).navigation({
						class: clsx($.get(theme)?.navigation, $$props.classes?.navigation)
					})),
					() => $.get(styles).button({ class: clsx($.get(theme)?.button, $$props.classes?.button) }),
					() => $.get(styles).buttonPrimary()
				]
			);

			$.delegated('click', button_1, skip);
			$.delegated('click', button_3, next);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (active() && $.get(currentStepData)) $$render(consequent_4);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click', 'keydown']);