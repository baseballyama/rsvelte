import * as $ from 'svelte/internal/server';
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { useSingleSelection } from "$lib/utils/singleselection.svelte";
import clsx from "clsx";
import { getAccordionContext } from "$lib/context";
import { slide } from "svelte/transition";
import { accordionItem } from "./theme";
import { untrack } from "svelte";

export default function AccordionItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			header,
			arrowup,
			arrowdown,
			headingTag,
			open = false,
			activeClass,
			inactiveClass,
			transitionType = slide,
			transitionParams,
			class: className,
			classes,
			headerClass,
			contentClass
		} = $$props;

		warnThemeDeprecation("AccordionItem", untrack(() => ({ headerClass, contentClass, activeClass, inactiveClass })), {
			headerClass: "button",
			contentClass: "content",
			activeClass: "active",
			inactiveClass: "inactive"
		});

		let styling = $.derived(() => classes ?? {
			button: headerClass,
			content: contentClass,
			active: activeClass,
			inactive: inactiveClass
		});

		// Get context - it will be undefined if used outside Accordion
		const ctx = getAccordionContext();

		const ctxTransitionType = $.derived(() => ctx?.transitionType ?? transitionType);

		// Check if transitionType is explicitly set to undefined in props
		const useTransition = $.derived(() => transitionType === "none" ? false : ctxTransitionType() === "none" ? false : true);

		// Theme context
		const theme = $.derived(() => getTheme("accordionItem"));

		// single selection
		const self = Symbol("accordion-item");

		const updateSingleSelection = useSingleSelection((value) => open = value === self);

		const handleToggle = () => {
			open = !open;
		};

		const $$d = $.derived(() => accordionItem({ flush: ctx?.flush, open })),
			base = $.derived(() => $$d().base),
			button = $.derived(() => $$d().button),
			content = $.derived(() => $$d().content),
			active = $.derived(() => $$d().active),
			inactive = $.derived(() => $$d().inactive);

		let buttonClass = $.derived(() => clsx(open && !ctx?.flush && (styling().active || ctx?.activeClass || active()()), !open && !ctx?.flush && (styling().inactive || ctx?.inactiveClass || inactive()())));

		$.element(
			$$renderer,
			headingTag ?? "h2",
			() => {
				$$renderer.push(`${$.attr_class($.clsx(base()({ class: clsx(theme()?.base, className) })))}`);
			},
			() => {
				$$renderer.push(`<button type="button"${$.attr_class($.clsx(button()({
					class: clsx(buttonClass(), theme()?.button, styling().button)
				})))}${$.attr('aria-expanded', open)}>`);

				if (header) {
					$$renderer.push('<!--[0-->');
					header($$renderer);
					$$renderer.push(`<!----> `);

					if (open) {
						$$renderer.push('<!--[0-->');

						if (!arrowup) {
							$$renderer.push(`<!--[0--><svg class="h-3 w-3 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"></path></svg>`);
						} else {
							$$renderer.push('<!--[-1-->');
							arrowup($$renderer);
							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]-->`);
					} else if (!arrowdown) {
						$$renderer.push(`<!--[1--><svg class="h-3 w-3 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"></path></svg>`);
					} else {
						$$renderer.push('<!--[-1-->');
						arrowdown($$renderer);
						$$renderer.push(`<!---->`);
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></button>`);
			}
		);

		$$renderer.push(` `);

		if (useTransition()) {
			$$renderer.push('<!--[0-->');

			if (open && transitionType !== "none") {
				$$renderer.push(`<!--[0--><div><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, styling().content) })))}>`);
				children($$renderer);
				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attr_class($.clsx(open ? "block" : "hidden"))}><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, styling().content) })))}>`);
			children($$renderer);
			$$renderer.push(`<!----></div></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { open });
	});
}