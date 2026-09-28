import * as $ from 'svelte/internal/server';
import { getContext } from "svelte";

export default function ExternalLink($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ctx = getContext("iconCtx") ?? {};

		let {
			size = ctx.size || "24",
			role = ctx.role || "img",
			color = ctx.color || "currentColor",
			strokeWidth = ctx.strokeWidth || "2",
			title,
			desc,
			ariaLabel = "external link",
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ariaDescribedby = $.derived(() => `${title?.id || ""} ${desc?.id || ""}`);
		const hasDescription = $.derived(() => !!(title?.id || desc?.id));

		$$renderer.push(`<svg${$.attributes(
			{
				xmlns: 'http://www.w3.org/2000/svg',
				...restProps,
				role,
				width: size,
				height: size,
				'aria-label': ariaLabel,
				'aria-describedby': hasDescription() ? ariaDescribedby() : undefined,
				viewBox: '0 0 24 24',
				fill: 'none',
				stroke: color,
				'stroke-width': strokeWidth,
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round'
			},
			void 0,
			void 0,
			void 0,
			3
		)}>`);

		if (title?.id && title.title) {
			$$renderer.push(`<!--[0--><title${$.attr('id', title.id)}>${$.escape(title.title)}</title>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);

		if (desc?.id && desc.desc) {
			$$renderer.push(`<!--[0--><desc${$.attr('id', desc.id)}>${$.escape(desc.desc)}</desc>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--><path d="M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6"></path><path d="M11 13l9 -9"></path><path d="M15 4h5v5"></path></svg>`);
	});
}