import * as $ from 'svelte/internal/server';
import Avatar from "./avatar.svelte";
import { overflowBase, sizeStyle, fontSizeStyle } from "./styles.js";
import { resolveOverlapPx } from "./utils.js";

export default function Avatar_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			members,
			size = 32,
			limit = 0,
			reverse = false,
			overlap = "auto",
			class: klass
		} = $$props;

		let visible = $.derived(() => limit > 0 ? members.slice(0, limit) : members);
		let overflow = $.derived(() => limit > 0 && members.length > limit ? members.length - limit : 0);
		let overlapPx = $.derived(() => resolveOverlapPx(size, overlap));
		let spacing = $.derived(() => `margin-left: -${overlapPx()}px;`);

		$$renderer.push(`<div${$.attr_class(`flex ${$.stringify(klass)}`)}${$.attr('aria-label', `${$.stringify(members.length)} members`)}><!--[-->`);

		const each_array = $.ensure_array_like(visible());

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let member = each_array[index];

			$$renderer.push(`<div class="relative"${$.attr_style(index > 0 ? spacing() : undefined, { 'z-index': reverse ? index + 1 : visible().length - index })}>`);

			Avatar($$renderer, {
				size,
				src: member.src,
				username: member.username,
				letter: member.letter,
				title: member.title,
				class: 'ring-kui-light-bg dark:ring-kui-dark-bg ring-1'
			});

			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]--> `);

		if (overflow() > 0) {
			$$renderer.push(`<!--[0--><div class="relative"${$.attr_style(visible().length > 0 ? spacing() : undefined, { 'z-index': reverse ? visible().length + 1 : 0 })}><div${$.attr_class($.clsx(overflowBase))}${$.attr_style(`${$.stringify(sizeStyle(size))}${$.stringify(fontSizeStyle(size))}`)}${$.attr('aria-label', `${$.stringify(overflow())} more members`)}>+${$.escape(overflow())}</div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}