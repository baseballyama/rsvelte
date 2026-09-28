import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { closeButton } from "./theme";
import { useDismiss } from "./dismissable";

export default function CloseButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			color = "gray",
			onclick: onclickorg,
			name = "Close",
			ariaLabel,
			size = "md",
			class: className,
			svgClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const $$d = $.derived(() => closeButton({ color, size })),
			base = $.derived(() => $$d().base),
			svg = $.derived(() => $$d().svg);

		const context = useDismiss();

		function onclick(event) {
			onclickorg?.(event);

			if (event.defaultPrevented) return;

			context?.dismiss?.(event);
		}

		if (restProps.href === undefined) {
			$$renderer.push(`<!--[0--><button${$.attributes({
				type: 'button',
				...restProps,
				class: $.clsx(base()({ class: clsx(className) })),
				'aria-label': ariaLabel ?? name
			})}>`);

			if (name) {
				$$renderer.push(`<!--[0--><span class="sr-only">${$.escape(name)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(svg()({ class: svgClass })))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`);
			}

			$$renderer.push(`<!--]--></button>`);
		} else {
			$$renderer.push(`<!--[-1--><a${$.attributes({
				...restProps,
				class: $.clsx(base()({ class: clsx(className) })),
				'aria-label': ariaLabel ?? name
			})}>`);

			if (name) {
				$$renderer.push(`<!--[0--><span class="sr-only">${$.escape(name)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (children) {
				$$renderer.push('<!--[0-->');
				children($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(svg()()))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`);
			}

			$$renderer.push(`<!--]--></a>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}