import * as $ from 'svelte/internal/server';
import { cn } from "$lib/utils.js";
import Self from "./toc.svelte";

export default function Toc($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { toc, isChild = false, class: className } = $$props;

		const getScrollBehavior = () => {
			if (typeof window === "undefined") return "auto";

			return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
		};

		function onHeadingClick(event, heading) {
			if (!heading.id) return;

			if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
				return;
			}

			event.preventDefault();
			heading.ref.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
			history.replaceState(null, "", `#${heading.id}`);
		}

		$$renderer.push(`<ul${$.attr_class($.clsx(cn("m-0 list-none text-sm font-normal", { "pl-4": isChild })))}><!--[-->`);

		const each_array = $.ensure_array_like(toc);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let heading = each_array[i];

			$$renderer.push(`<li${$.attr_class($.clsx(cn("mt-0 truncate pt-2 text-muted-foreground transition-all", { "text-foreground": heading.active })))}>`);

			if (heading.id) {
				$$renderer.push(`<!--[0--><a${$.attr('href', `#${$.stringify(heading.id)}`)} class="block hover:text-foreground">${$.escape(heading.label)}</a>`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(heading.label)}`);
			}

			$$renderer.push(`<!--]--></li> `);

			if (heading.children.length > 0) {
				$$renderer.push('<!--[0-->');
				Self($$renderer, { class: className, toc: heading.children, isChild: true });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}