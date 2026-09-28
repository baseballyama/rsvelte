import * as $ from 'svelte/internal/server';
import { groupItem } from "./theme";
import clsx from "clsx";
import { getTheme, warnThemeDeprecation } from "$lib/theme/themeUtils";
import { untrack } from "svelte";

export default function GroupItem($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			timelines,
			aClass,
			imgClass,
			divClass,
			titleClass,
			spanClass,
			class: className,
			classes,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		warnThemeDeprecation("GroupItem", untrack(() => ({ aClass, imgClass, divClass, titleClass, spanClass })), {
			aClass: "class",
			imgClass: "img",
			divClass: "div",
			titleClass: "title",
			spanClass: "span"
		});

		const styling = $.derived(() => classes ?? {
			img: imgClass,
			div: divClass,
			title: titleClass,
			span: spanClass,
			a: aClass
		});

		const theme = $.derived(() => getTheme("groupItem"));

		const $$d = $.derived(groupItem),
			base = $.derived(() => $$d().base),
			a = $.derived(() => $$d().a),
			img = $.derived(() => $$d().img),
			div = $.derived(() => $$d().div),
			title = $.derived(() => $$d().title),
			span = $.derived(() => $$d().span),
			svg = $.derived(() => $$d().svg);

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(timelines);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let { name, src, alt, isPrivate, href, comment, id } = each_array[index];

			$$renderer.push(`<li${$.attributes({
				class: $.clsx(base()({ class: clsx(theme()?.base, className) })),
				...restProps
			})}><a${$.attr('href', href)}${$.attr_class($.clsx(a()({ class: clsx(theme()?.a, styling().a) })))}><img${$.attr_class($.clsx(img()({ class: clsx(theme()?.img, styling().img) })))}${$.attr('src', src)}${$.attr('alt', alt)}/> <div${$.attr_class($.clsx(div()({ class: clsx(theme()?.div, styling().div) })))}><div${$.attr_class($.clsx(title()({ class: clsx(theme()?.title, styling().title) })))}>${$.html(name)}</div> `);

			if (comment) {
				$$renderer.push(`<!--[0--><div class="text-sm font-normal">${$.escape(comment)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span${$.attr_class($.clsx(span()({ class: clsx(theme()?.span, styling().span) })))}>`);

			if (isPrivate) {
				$$renderer.push(`<!--[0--><svg${$.attr_class($.clsx(svg()({ class: clsx(theme()?.svg, classes?.svg) })))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"></path><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z"></path></svg> Private`);
			} else {
				$$renderer.push(`<!--[-1--><svg${$.attr_class($.clsx(svg()({ class: clsx(theme()?.svg, classes?.svg) })))} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clip-rule="evenodd"></path></svg> Public`);
			}

			$$renderer.push(`<!--]--></span></div></a></li>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}