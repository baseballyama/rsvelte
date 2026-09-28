import * as $ from 'svelte/internal/server';
import { avatar } from "./theme";
import clsx from "clsx";
import Indicator from "$lib/indicator/Indicator.svelte";
import { getTheme } from "$lib/theme/themeUtils";

export default function Avatar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			indicator,
			src,
			href,
			target,
			cornerStyle = "circular",
			border = false,
			stacked = false,
			dot,
			class: className,
			alt,
			size = "md",
			onclick,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		// Theme context
		const theme = $.derived(() => getTheme("avatar"));

		let dotProps = $.derived(() => dot
			? { placement: "top-right", color: "gray", size: "lg", ...dot }
			: undefined);

		let avatarClass = $.derived(() => avatar({
			cornerStyle,
			border,
			stacked,
			size,
			class: clsx(theme(), className)
		}));

		if (!src || !!href || children || dot || indicator) {
			$$renderer.push('<!--[0-->');

			$.element(
				$$renderer,
				href ? "a" : "div",
				() => {
					$$renderer.push(`${$.attributes({
						role: href ? undefined : "button",
						href,
						target,
						...restProps,
						class: $.clsx(avatarClass())
					})}`);
				},
				() => {
					if (src) {
						$$renderer.push(`<!--[0--><img${$.attr('alt', alt)}${$.attr('src', src)}${$.attr_class($.clsx(cornerStyle === "circular" ? "rounded-full" : "rounded-sm"))}/>`);
					} else if (children) {
						$$renderer.push('<!--[1-->');
						children($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><svg${$.attr_class(`h-full w-full ${cornerStyle === 'circular' ? 'rounded-full' : 'rounded-sm'}`)} fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>`);
					}

					$$renderer.push(`<!--]--> `);

					if (dotProps()) {
						$$renderer.push('<!--[0-->');

						Indicator($$renderer, $.spread_props([
							{
								border: true,
								offset: cornerStyle === "circular" ? true : false
							},
							dotProps()
						]));
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					if (indicator) {
						$$renderer.push('<!--[0-->');
						indicator($$renderer);
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}
			);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attributes({ alt, src, ...restProps, class: $.clsx(avatarClass()) })} onload="this.__e=event" onerror="this.__e=event"/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}