import * as $ from 'svelte/internal/server';
import { getTabs } from './context.ts';

export default function TabsContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value, class: className = '', children } = $$props;
		const ctx = getTabs();
		const active = $.derived(() => ctx.value === value);

		if (active()) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`tabs-content ${$.stringify(className)}`)} role="tabpanel">`);
			children($$renderer);
			$$renderer.push(`<!----></div> `);

			$$renderer.push(`<style>
		.tabs-content {
			margin-top: 0.5rem;
			width: 100%;
			outline: none;
		}
	</style>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}