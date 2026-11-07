import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";

export default function DocBadge($$renderer, $$props) {
	let { children, class: className } = $$props;

	Badge($$renderer, {
		class: `bg-primary-100 text-primary-700 dark:text-primary-700 border-primary-700 dark:border-primary-700 dark:bg-gray-700 ${$.stringify(className)}`,
		children: ($$renderer) => {
			children($$renderer);
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}