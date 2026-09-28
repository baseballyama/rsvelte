import * as $ from 'svelte/internal/server';
import { getters } from "../utils/getters.svelte";
import { Combobox as Builder } from "../builders/Combobox.svelte";

export default function Combobox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = void 0,
			highlighted = void 0,
			children,
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