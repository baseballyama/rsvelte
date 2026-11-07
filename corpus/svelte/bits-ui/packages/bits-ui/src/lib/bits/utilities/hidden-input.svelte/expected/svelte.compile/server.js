import * as $ from 'svelte/internal/server';
import { mergeProps, srOnlyStyles } from "svelte-toolbelt";

export default function Hidden_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0, $$slots, $$events, ...restProps } = $$props;

		const mergedProps = $.derived(() => mergeProps(restProps, {
			"aria-hidden": "true",
			tabindex: -1,
			style: { ...srOnlyStyles, position: "absolute", top: "0", left: "0" }
		}));

		if (mergedProps().type === "checkbox") {
			$$renderer.push(`<!--[0--><input${$.attributes({ ...mergedProps(), value }, void 0, void 0, void 0, 4)}/>`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attributes({ value, ...mergedProps() }, void 0, void 0, void 0, 4)}/>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { value });
	});
}