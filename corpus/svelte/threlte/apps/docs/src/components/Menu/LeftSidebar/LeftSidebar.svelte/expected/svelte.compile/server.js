import * as $ from 'svelte/internal/server';
import LeftSidebarCategory from './LeftSidebarCategory.svelte';

export default function LeftSidebar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { menu, activeSidebarTab, activeUrlPathName, baseUrl } = $$props;

		$$renderer.push(`<nav class="relative hidden h-full w-full pr-2 pl-6 md:block"><ul id="sidebar-scrollwindow" class="mt-0 block h-full overflow-x-hidden overflow-y-scroll pb-24 lg:pt-6"><!--[-->`);

		const each_array = $.ensure_array_like(menu[activeSidebarTab].categories);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let category = each_array[$$index];

			$$renderer.push(`<li class="mb-6 text-sm">`);
			LeftSidebarCategory($$renderer, { category, activeUrlPathName, baseUrl });
			$$renderer.push(`<!----></li>`);
		}

		$$renderer.push(`<!--]--></ul></nav>`);
	});
}