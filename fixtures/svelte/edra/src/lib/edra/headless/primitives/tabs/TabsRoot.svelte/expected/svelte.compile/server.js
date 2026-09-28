import * as $ from 'svelte/internal/server';
import { setTabs } from './context.ts';

export default function TabsRoot($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = '', onValueChange, class: className = '', children } = $$props;

		const context = {
			get value() {
				return value;
			},

			setValue(val) {
				value = val;
				onValueChange?.(val);
			}
		};

		setTabs(context);
		$$renderer.push(`<div${$.attr_class(`tabs-root ${$.stringify(className)}`, 'svelte-qy6xco')}>`);
		children($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { value });
	});
}