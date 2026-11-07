import * as $ from 'svelte/internal/server';
import { resolveBadgeClass, iconSizeStyles, iconGapStyles } from "./styles.js";

export default function Badge($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			href = undefined,
			target = undefined,
			rel = undefined,
			download = undefined,
			class: klass,
			variant = "gray",
			contrast = "high",
			size = "md",
			icon = undefined,
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let badgeClass = $.derived(() => resolveBadgeClass({ variant, contrast, size, class: klass }));
		let iconSizeClass = $.derived(() => iconSizeStyles[size]);
		let iconGap = $.derived(() => iconGapStyles[size]);

		function iconSnip($$renderer) {
			if (icon) {
				$$renderer.push('<!--[0-->');

				const Icon = icon;

				$$renderer.push(`<span${$.attr_class(`flex items-center justify-center ${$.stringify(iconSizeClass())}`)}>`);

				if (Icon) {
					$$renderer.push('<!--[-->');
					Icon($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(`</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		if (href) {
			$$renderer.push(`<!--[0--><a${$.attributes({
				href,
				target,
				rel,
				download,
				class: $.clsx(badgeClass()),
				...rest
			})}><span${$.attr_class(`flex items-center ${$.stringify(iconGap())}`)}>`);

			iconSnip($$renderer);
			$$renderer.push(`<!----> `);
			children?.($$renderer);
			$$renderer.push(`<!----></span></a>`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ class: $.clsx(badgeClass()), ...rest })}><span${$.attr_class(`flex items-center ${$.stringify(iconGap())}`)}>`);
			iconSnip($$renderer);
			$$renderer.push(`<!----> `);
			children?.($$renderer);
			$$renderer.push(`<!----></span></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}