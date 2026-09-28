import * as $ from 'svelte/internal/server';
import { getTheme } from "$lib/theme/themeUtils";
import clsx from "clsx";
import { setToolbarContext } from "$lib/context";
import { toolbar } from "./theme";

export default function Toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			end,
			color,
			embedded,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("toolbar"));
		const context = { separators: false };

		// Create context object with getter
		const ctx = {
			get separators() {
				return context.separators;
			},

			set separators(value) {
				context.separators = value;
			}
		};

		// Set context during initialization
		setToolbarContext(ctx);

		let frameColor = $.derived(() => embedded ? "default" : color);

		let $$d = $.derived(() => toolbar({
				color: frameColor(),
				embedded,
				separators: context.separators
			})),
			base = $.derived(() => $$d().base),
			content = $.derived(() => $$d().content);

		$$renderer.push(`<div${$.attributes({
			...// let separatorsClass: string = twMerge($separators && 'sm:divide-x rtl:divide-x-reverse');
			// let divClass: string = twMerge('flex justify-between items-center', !embedded && 'py-2 px-3', className);
			restProps,
			class: $.clsx(base()({ class: clsx(theme()?.base, className) }))
		})}><div${$.attr_class($.clsx(content()({ class: clsx(theme()?.content, classes?.content) })))}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div> `);

		if (end) {
			$$renderer.push('<!--[0-->');
			end($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}