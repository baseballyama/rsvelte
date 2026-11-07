import * as $ from 'svelte/internal/server';
import { useElementMounted } from '$hooks/useElementMounted';
import { fade } from 'svelte/transition';
import { customSlide } from './customSlide';
import BurgerIcon from './BurgerIcon.svelte';
import Search from '$components/Search/Search.svelte';

export default function MobileNav($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { search = false, topbarLeft, topbarRight, content } = $$props;
		let showMenu = false;
		const { action, mounted } = useElementMounted();
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="fixed top-0 left-0 z-40 flex max-h-screen w-full flex-col md:hidden"><header${$.attr_class($.clsx([
				'flex h-[var(--docs-navbar-height)] w-full shrink-0 flex-row items-center justify-between border-b bg-[#0A0F19] px-6 py-2',
				$.store_get($$store_subs ??= {}, '$mounted', mounted) ? 'border-b-transparent' : 'border-b-orange/25'
			]))}><div>`);

			topbarLeft?.($$renderer);
			$$renderer.push(`<!----></div> <div class="max-w-[30%]"></div> <div class="flex flex-row items-center justify-end gap-4"><div>`);
			topbarRight?.($$renderer);
			$$renderer.push(`<!----></div> `);

			BurgerIcon($$renderer, {
				get showMenu() {
					return showMenu;
				},

				set showMenu($$value) {
					showMenu = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></header> `);

			if (showMenu) {
				$$renderer.push(`<!--[0--><div class="border-b-orange/25 -z-10 min-h-0 w-full overflow-auto border-b bg-[#0a0F19]"><div class="px-6 pt-2 pb-6">`);

				if (search) {
					$$renderer.push(`<!--[0--><div class="relative w-full pt-4 pb-8">`);
					Search($$renderer, {});
					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);
				content?.($$renderer);
				$$renderer.push(`<!----></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="h-[var(--docs-navbar-height)]"></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}