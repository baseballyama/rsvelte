import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PaginationButtonState } from "../pagination.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Pagination_prev_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			child,
			children,
			ref = null,
			type = "button",
			disabled = false,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const prevButtonState = PaginationButtonState.create({
			type: "prev",
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			disabled: boxWith(() => Boolean(disabled))
		});

		const mergedProps = $.derived(() => mergeProps(restProps, prevButtonState.props, { type }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><button${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}