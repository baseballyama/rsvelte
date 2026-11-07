import * as $ from 'svelte/internal/server';
import { codewrapper } from "./theme";

export default function CodeWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			codeblock,
			innerClass,
			codeClass,
			class: classname,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const $$d = $.derived(codewrapper),
			base = $.derived(() => $$d().base),
			inner = $.derived(() => $$d().inner);

		const codeCls = $.derived(() => children ? "border-t border-gray-200 dark:border-gray-600" : "");

		$$renderer.push(`<div${$.attributes({ ...restProps, class: $.clsx(base()({ class: classname })) })}>`);

		if (children) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(inner()({ class: innerClass })))}>`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (codeblock) {
			$$renderer.push(`<!--[0--><div${$.attr_class(`${codeCls()} ${$.stringify(codeClass)}`)}>`);
			codeblock($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}