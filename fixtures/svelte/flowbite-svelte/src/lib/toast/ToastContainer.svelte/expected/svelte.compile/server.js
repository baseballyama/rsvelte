import * as $ from 'svelte/internal/server';
import clsx from "clsx";
import { toastContainer } from "./theme";
import { getTheme } from "$lib/theme/themeUtils";

export default function ToastContainer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			position = "top-right",
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("toastContainer"));

		const positionClasses = {
			"top-left": "top-4 left-4",
			"top-right": "top-4 right-4",
			"bottom-left": "bottom-4 left-4",
			"bottom-right": "bottom-4 right-4"
		};

		const base = $.derived(() => toastContainer({ class: clsx(positionClasses[position], theme(), className) }));

		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(base()) })}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}