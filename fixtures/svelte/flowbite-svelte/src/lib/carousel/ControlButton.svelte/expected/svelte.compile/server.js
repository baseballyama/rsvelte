import * as $ from 'svelte/internal/server';
import { controlButton } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";

export default function ControlButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			forward,
			name,
			class: className,
			spanClass,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const $$d = $.derived(() => controlButton({ forward })),
			base = $.derived(() => $$d().base),
			span = $.derived(() => $$d().span);

		const theme = $.derived(() => getTheme("controlButton"));

		$$renderer.push(`<button${$.attributes({
			type: 'button',
			class: $.clsx(base()({ class: clsx(className, theme()) })),
			...restProps
		})}>`);

		if (children) {
			$$renderer.push('<!--[0-->');
			children($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attr_class($.clsx(span()({ class: clsx(spanClass) })))}>`);

			if (forward) {
				$$renderer.push(`<!--[0--><svg aria-hidden="true" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`);
			} else {
				$$renderer.push(`<!--[-1--><svg aria-hidden="true" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>`);
			}

			$$renderer.push(`<!--]--> `);

			if (name) {
				$$renderer.push(`<!--[0--><span class="sr-only">${$.escape(name)}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></span>`);
		}

		$$renderer.push(`<!--]--></button>`);
	});
}