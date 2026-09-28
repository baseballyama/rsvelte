import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { PaginationRootState } from "../pagination.svelte.js";
import { noop } from "$lib/internal/noop.js";
import { createId } from "$lib/internal/create-id.js";

export default function Pagination($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			count,
			perPage = 1,
			page = 1,
			ref = null,
			siblingCount = 1,
			onPageChange = noop,
			loop = false,
			orientation = "horizontal",
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const rootState = PaginationRootState.create({
			id: boxWith(() => id),
			count: boxWith(() => count),
			perPage: boxWith(() => perPage),
			page: boxWith(() => page, (v) => {
				page = v;
				onPageChange?.(v);
			}),
			loop: boxWith(() => loop),
			siblingCount: boxWith(() => siblingCount),
			orientation: boxWith(() => orientation),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, rootState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps(), ...rootState.snippetProps });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
			children?.($$renderer, rootState.snippetProps);
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { page, ref });
	});
}