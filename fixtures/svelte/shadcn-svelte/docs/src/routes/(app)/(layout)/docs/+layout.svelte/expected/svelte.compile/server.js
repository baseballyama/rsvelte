import * as $ from 'svelte/internal/server';
import * as Sidebar from "$lib/registry/ui/sidebar/index.js";
import DocsSidebar from "$lib/components/docs-sidebar.svelte";
import { sidebarNavItems } from "$lib/navigation.js";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$$renderer.push(`<div class="container-wrapper flex flex-1 flex-col px-2">`);

	if (Sidebar.Provider) {
		$$renderer.push('<!--[-->');

		Sidebar.Provider($$renderer, {
			class: 'min-h-min flex-1 items-start px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)] 3xl:fixed:container 3xl:fixed:px-3',
			style: '--sidebar-width: calc(var(--spacing) * 72)',
			children: ($$renderer) => {
				DocsSidebar($$renderer, { navItems: sidebarNavItems });
				$$renderer.push(`<!----> <div class="h-full w-full">`);
				children($$renderer);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}