import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import { getIconForLanguageExtension } from "../icons/icons.js";

export default function Figcaption($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			class: className,
			children,
			"data-language": language,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const Icon = $.derived(() => language && typeof language === "string" ? getIconForLanguageExtension(language) : null);

		$$renderer.push(`<figcaption${$.attributes({
			class: $.clsx(cn("flex items-center gap-2 text-code-foreground [&_svg]:size-4 [&_svg]:text-code-foreground [&_svg]:opacity-70", className)),
			...restProps
		})}>`);

		if (Icon()) {
			$$renderer.push('<!--[0-->');

			if (Icon()) {
				$$renderer.push('<!--[-->');
				Icon()($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		children?.($$renderer);
		$$renderer.push(`<!----></figcaption>`);
	});
}