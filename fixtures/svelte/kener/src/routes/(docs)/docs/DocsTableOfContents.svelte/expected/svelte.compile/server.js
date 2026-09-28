import * as $ from 'svelte/internal/server';

export default function DocsTableOfContents($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { items } = $$props;
		let activeId = "";

		// Re-run whenever items changes (e.g. on soft navigation)
		// Wait a tick for the DOM to update with new content
		function scrollToHeading(id) {
			const element = document.getElementById(id);

			if (element) {
				const offset = 120; // Account for navbar height (96px) + some padding
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.scrollY - offset;

				window.scrollTo({ top: offsetPosition, behavior: "smooth" });
				activeId = id;
			}
		}

		if (items.length > 0) {
			$$renderer.push(`<!--[0--><aside class="scrollbar-hidden sticky top-[calc(96px+2rem)] hidden max-h-[calc(100vh-96px-4rem)] w-[220px] shrink-0 overflow-y-auto xl:block"><div class="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">On this page</div> <nav><ul class="m-0 list-none p-0"><!--[-->`);

			const each_array = $.ensure_array_like(items);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let item = each_array[index];

				$$renderer.push(`<li${$.attr_class('mb-0', void 0, { 'pl-3': item.level === 3, 'pl-6': item.level === 4 })}><button${$.attr_class('text-muted-foreground hover:text-foreground block cursor-pointer border-none bg-transparent py-1 text-left text-[0.8125rem] no-underline transition-colors duration-200 svelte-m0vs27', void 0, { 'active': activeId === item.id })}>${$.escape(item.text)}</button></li>`);
			}

			$$renderer.push(`<!--]--></ul></nav></aside>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}