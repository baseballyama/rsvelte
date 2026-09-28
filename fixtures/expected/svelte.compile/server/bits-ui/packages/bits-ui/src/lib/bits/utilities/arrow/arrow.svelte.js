import * as $ from 'svelte/internal/server';
import { mergeProps } from "svelte-toolbelt";
import { useId } from "$lib/internal/use-id.js";

export default function Arrow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id = useId(),
			children,
			child,
			width = 10,
			height = 5,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const mergedProps = $.derived(() => mergeProps(restProps, { id }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><span${$.attributes({ ...mergedProps() })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><svg${$.attr('width', width)}${$.attr('height', height)} viewBox="0 0 30 10" preserveAspectRatio="none" data-arrow=""><polygon points="0,0 30,0 15,10" fill="currentColor"></polygon></svg>`);
			}

			$$renderer.push(`<!--]--></span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}