import * as $ from 'svelte/internal/server';
import { twMerge } from "tailwind-merge";

const getText = (node) => {
	const text = [...node.childNodes].find((child) => child.nodeType === Node.TEXT_NODE);

	return text && text.textContent?.trim() || "";
};

export function extract(x) {
	if (x.firstElementChild) return {
		rel: x.tagName,
		href: "#" + x.firstElementChild?.id,
		name: getText(x)
	};

	return { name: "" };
}

export default function Anchor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			tag,
			class: className,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let content = "";
		let slug = "";

		function init(node) {
			content = getText(node);
			slug = content.replace(/\s/g, "-").toLocaleLowerCase();
		}

		let elemClass = $.derived(() => twMerge("relative group", className));

		$.element(
			$$renderer,
			tag,
			() => {
				$$renderer.push(`${$.attributes({ ...restProps, class: $.clsx(elemClass()) })}`);
			},
			() => {
				children($$renderer);
				$$renderer.push(`<!----> <span${$.attr('id', slug)} class="absolute -top-[140px]"></span> <a class="text-primary-700 dark:text-primary-700 ms-2 opacity-0 transition-opacity group-hover:opacity-100"${$.attr('href', `#${$.stringify(slug)}`)}${$.attr('aria-label', `Link to this section: ${$.stringify(content)}`)}>#</a>`);
			}
		);
	});
}