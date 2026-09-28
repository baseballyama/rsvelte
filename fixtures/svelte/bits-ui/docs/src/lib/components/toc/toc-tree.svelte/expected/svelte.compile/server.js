import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils/styles.js";
import Tree from "./toc-tree.svelte";

export default function Toc_tree($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { tree, level = 1, activeUrl } = $$props;

		if (tree?.items?.length && level < 3) {
			$$renderer.push(`<!--[0--><ul${$.attr_class($.clsx(cn("m-0 list-none", {
				"pl-4": level !== 1,
				"border-border/50 border-l": level === 1
			})))}><!--[-->`);

			const each_array = $.ensure_array_like(tree.items);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let item = each_array[index];
				const isActive = activeUrl === item.url;

				$$renderer.push(`<li${$.attr_class($.clsx(cn("mt-0")))}><a${$.attr('aria-current', isActive ? "location" : undefined)}${$.attr('href', item.url)}${$.attr_class($.clsx(cn(
					"hover:text-foreground inline-block border-l border-l-transparent py-[5px] pl-5 leading-4 no-underline",
					isActive
						? "text-foreground border-l-foreground"
						: "text-muted-foreground border-l-transparent",
					level !== 1 && "-ml-4 pl-10"
				)))}>${$.escape(item.title)}</a> `);

				if (item.items?.length) {
					$$renderer.push('<!--[0-->');
					Tree($$renderer, { tree: item, level: level + 1, activeUrl });
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></li>`);
			}

			$$renderer.push(`<!--]--></ul>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}