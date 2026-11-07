import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PaginationPageState } from "../pagination.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Pagination_page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			page,
			child,
			children,
			type = "button",
			ref = null,
			disabled = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const pageState = PaginationPageState.create({
			id: boxWith(() => id),
			page: boxWith(() => page),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled))
		});

		const mergedProps = $.derived(() => mergeProps(restProps, pageState.props, { type }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);

			if (children) {
				$$renderer.push('<!--[0-->');
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1-->${$.escape(page.value)}`);
			}

			$$renderer.push(`<!--]--></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}