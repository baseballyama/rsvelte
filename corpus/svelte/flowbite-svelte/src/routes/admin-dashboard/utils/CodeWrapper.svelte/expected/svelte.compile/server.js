import * as $ from 'svelte/internal/server';
import { codewrapper } from "./theme";

export default function CodeWrapper($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, codeblock, innerClass, class: classname } = $$props;

		const $$d = $.derived(codewrapper),
			base = $.derived(() => $$d().base),
			inner = $.derived(() => $$d().inner);

		$$renderer.push(`<div${$.attr_class($.clsx(base()({ class: classname })))}>`);

		if (children) {
			$$renderer.push(`<!--[0--><div${$.attr_class($.clsx(inner()({ class: innerClass })))}>`);
			children($$renderer);
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (codeblock) {
			$$renderer.push('<!--[0-->');
			codeblock($$renderer);
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}