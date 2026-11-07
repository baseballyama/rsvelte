import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { useSingleSelection } from "$lib/utils/singleselection.svelte";
import clsx from "clsx";
import { getAccordionContext } from "$lib/context";
import { slide } from "svelte/transition";
import { accordionItem } from "./theme";
import { untrack } from "svelte";

var root = $.from_svg(`<svg class="h-3 w-3 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"></path></svg>`);
var root_1 = $.from_svg(`<svg class="h-3 w-3 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path></svg>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<button type="button"><!></button>`);
var root_4 = $.from_html(`<div><div><!></div></div>`);

export default function AccordionItem($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		transitionType = $.prop($$props, 'transitionType', 3, slide);

	warnThemeDeprecation(
		"AccordionItem",
		untrack(() => ({
			headerClass: $$props.headerClass,
			contentClass: $$props.contentClass,
			activeClass: $$props.activeClass,
			inactiveClass: $$props.inactiveClass
		})),
		{
			headerClass: "button",
			contentClass: "content",
			activeClass: "active",
			inactiveClass: "inactive"
		}
	);

	let styling = $.derived(() => $$props.classes ?? {
		button: $$props.headerClass,
		content: $$props.contentClass,
		active: $$props.activeClass,
		inactive: $$props.inactiveClass
	});

	// Get context - it will be undefined if used outside Accordion
	const ctx = getAccordionContext();

	const ctxTransitionType = $.derived(() => ctx?.transitionType ?? transitionType());

	// Check if transitionType is explicitly set to undefined in props
	const useTransition = $.derived(() => transitionType() === "none"
		? false
		: $.get(ctxTransitionType) === "none" ? false : true);

	// Theme context
	const theme = $.derived(() => getTheme("accordionItem"));

	// single selection
	const self = Symbol("accordion-item");

	const updateSingleSelection = useSingleSelection((value) => open(value === self));

	$.user_effect(() => {
		updateSingleSelection(open(), self);
	});

	const handleToggle = () => {
		open(!open());
	};

	const $$d = $.derived(() => accordionItem({ flush: ctx?.flush, open: open() })),
		base = $.derived(() => $.get($$d).base),
		button = $.derived(() => $.get($$d).button),
		content = $.derived(() => $.get($$d).content),
		active = $.derived(() => $.get($$d).active),
		inactive = $.derived(() => $.get($$d).inactive);

	let buttonClass = $.derived(() => clsx(open() && !ctx?.flush && ($.get(styling).active || ctx?.activeClass || $.get(active)()), !open() && !ctx?.flush && ($.get(styling).inactive || ctx?.inactiveClass || $.get(inactive)())));
	var fragment = root_2();
	var node = $.first_child(fragment);

	$.element(node, () => $$props.headingTag ?? "h2", false, ($$element, $$anchor) => {
		$.attribute_effect($$element, ($0) => ({ class: $0 }), [
			() => $.get(base)({ class: clsx($.get(theme)?.base, $$props.class) })
		]);

		var button_1 = root_3();
		var node_1 = $.child(button_1);

		{
			var consequent_3 = ($$anchor) => {
				var fragment_1 = root_2();
				var node_2 = $.first_child(fragment_1);

				$.snippet(node_2, () => $$props.header);

				var node_3 = $.sibling(node_2, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_4 = $.first_child(fragment_2);

						{
							var consequent = ($$anchor) => {
								var svg = root();

								$.append($$anchor, svg);
							};

							var alternate = ($$anchor) => {
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								$.snippet(node_5, () => $$props.arrowup);
								$.append($$anchor, fragment_3);
							};

							$.if(node_4, ($$render) => {
								if (!$$props.arrowup) $$render(consequent); else $$render(alternate, -1);
							});
						}

						$.append($$anchor, fragment_2);
					};

					var consequent_2 = ($$anchor) => {
						var svg_1 = root_1();

						$.append($$anchor, svg_1);
					};

					var alternate_1 = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_6 = $.first_child(fragment_4);

						$.snippet(node_6, () => $$props.arrowdown);
						$.append($$anchor, fragment_4);
					};

					$.if(node_3, ($$render) => {
						if (open()) $$render(consequent_1); else if (!$$props.arrowdown) $$render(consequent_2, 1); else $$render(alternate_1, -1);
					});
				}

				$.append($$anchor, fragment_1);
			};

			$.if(node_1, ($$render) => {
				if ($$props.header) $$render(consequent_3);
			});
		}

		$.reset(button_1);

		$.template_effect(
			($0) => {
				$.set_class(button_1, 1, $0);
				$.set_attribute(button_1, 'aria-expanded', open());
			},
			[
				() => $.clsx($.get(button)({
					class: clsx($.get(buttonClass), $.get(theme)?.button, $.get(styling).button)
				}))
			]
		);

		$.delegated('click', button_1, handleToggle);
		$.append($$anchor, button_1);
	});

	var node_7 = $.sibling(node, 2);

	{
		var consequent_5 = ($$anchor) => {
			var fragment_5 = $.comment();
			var node_8 = $.first_child(fragment_5);

			{
				var consequent_4 = ($$anchor) => {
					var div = root_4();
					var div_1 = $.child(div);
					var node_9 = $.child(div_1);

					$.snippet(node_9, () => $$props.children);
					$.reset(div_1);
					$.reset(div);

					$.template_effect(($0) => $.set_class(div_1, 1, $0), [
						() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $.get(styling).content) }))
					]);

					$.transition(3, div, transitionType, () => $$props.transitionParams);
					$.append($$anchor, div);
				};

				$.if(node_8, ($$render) => {
					if (open() && transitionType() !== "none") $$render(consequent_4);
				});
			}

			$.append($$anchor, fragment_5);
		};

		var alternate_2 = ($$anchor) => {
			var div_2 = root_4();
			var div_3 = $.child(div_2);
			var node_10 = $.child(div_3);

			$.snippet(node_10, () => $$props.children);
			$.reset(div_3);
			$.reset(div_2);

			$.template_effect(
				($0) => {
					$.set_class(div_2, 1, $.clsx(open() ? "block" : "hidden"));
					$.set_class(div_3, 1, $0);
				},
				[
					() => $.clsx($.get(content)({ class: clsx($.get(theme)?.content, $.get(styling).content) }))
				]
			);

			$.append($$anchor, div_2);
		};

		$.if(node_7, ($$render) => {
			if ($.get(useTransition)) $$render(consequent_5); else $$render(alternate_2, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);