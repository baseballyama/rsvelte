import * as $ from 'svelte/internal/server';
import { getters } from "../utils/getters.svelte";
import { Select as Builder } from "../builders/Select.svelte";

export default function Select($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			children,
			highlighted = void 0,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const select = new Builder({
			value: () => value,
			onValueChange(v) {
				value = v;
			},
			highlighted: () => highlighted,
			onHighlightChange(v) {
				highlighted = v;
			},
			...getters({ ...rest }),
			focus: { ...getters(rest).focus },
			// onNavigate should not be wrapped in a getter since it's a callback function
			onNavigate: rest.onNavigate
		});

		children($$renderer, select);
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { value, highlighted, select });
	});
}