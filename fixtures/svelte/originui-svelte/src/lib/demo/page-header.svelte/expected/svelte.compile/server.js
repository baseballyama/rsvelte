import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Page_header($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, ref = null, title, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cn('mb-16 text-center', restProps.class)))}><h1 id="title" class="text-foreground mb-3 font-serif text-4xl/[1.1] font-bold md:text-5xl/[1.1]">${$.escape(title)}</h1> <p class="text-muted-foreground text-lg">`);
		children?.($$renderer);
		$$renderer.push(`<!----></p></div>`);
		$.bind_props($$props, { ref });
	});
}