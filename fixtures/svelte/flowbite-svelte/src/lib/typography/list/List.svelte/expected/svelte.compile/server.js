import * as $ from 'svelte/internal/server';
import { list } from "./theme";
import clsx from "clsx";
import { getTheme } from "$lib/theme/themeUtils";
import { setListContext } from "$lib/context";

export default function List($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			tag = "ul",
			isContenteditable = false,
			position = "inside",
			ctxClass,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const theme = $.derived(() => getTheme("list"));
		let contextClass = $.derived(() => ctxClass || "");

		// Create context object
		const ctx = {
			get ctxClass() {
				return contextClass();
			}
		};

		// Set context during initialization
		setListContext(ctx);

		let classList = $.derived(() => list({ position, tag, class: clsx(theme(), className) }));

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attributes({
					...restProps,
					class: $.clsx(classList()),
					contenteditable: isContenteditable
				})}`);
			},
			() => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			}
		);
	});
}