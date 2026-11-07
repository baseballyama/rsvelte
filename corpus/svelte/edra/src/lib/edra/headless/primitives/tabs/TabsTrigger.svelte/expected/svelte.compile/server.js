import * as $ from 'svelte/internal/server';
import { getTabs } from './context.ts';

export default function TabsTrigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, class: className = '', children } = $$props;
		const ctx = getTabs();
		const active = $.derived(() => ctx.value === value);

		$$renderer.push(`<button type="button" role="tab"${$.attr('aria-selected', active())}${$.attr('tabindex', active() ? 0 : -1)}${$.attr_class(`tabs-trigger ${active() ? 'active' : 'inactive'} ${$.stringify(className)}`, 'svelte-19ti9wg')}>`);
		children($$renderer);
		$$renderer.push(`<!----></button>`);
	});
}