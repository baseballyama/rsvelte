import * as $ from 'svelte/internal/server';
import { buttonGroup } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";
import { setButtonGroupContext } from "$lib/context";

export default function ButtonGroup($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			size = "md",
			disabled,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("buttonGroup"));
		let groupClass = $.derived(() => buttonGroup({ size, class: clsx(theme(), className) }));

		// Create a reactive context object
		// The object itself stays the same, but its properties are reactive
		const reactiveCtx = {
			get size() {
				return size;
			},

			get disabled() {
				return disabled;
			}
		};

		setButtonGroupContext(reactiveCtx);
		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(groupClass()), role: 'group' })}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}