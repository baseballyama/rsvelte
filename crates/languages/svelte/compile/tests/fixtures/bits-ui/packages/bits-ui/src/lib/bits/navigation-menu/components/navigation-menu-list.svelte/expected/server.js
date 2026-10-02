import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { NavigationMenuListState } from "../navigation-menu.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import Mounted from "$lib/bits/utilities/mounted.svelte";

export default function Navigation_menu_list($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			children,
			child,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const listState = NavigationMenuListState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, listState.props));
		const wrapperProps = $.derived(() => mergeProps(listState.wrapperProps));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (child) {
				$$renderer.push('<!--[0-->');
				child($$renderer, { props: mergedProps(), wrapperProps: wrapperProps() });
				$$renderer.push(`<!----> `);

				Mounted($$renderer, {
					get mounted() {
						return listState.wrapperMounted;
					},

					set mounted($$value) {
						listState.wrapperMounted = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attributes({ ...wrapperProps() })}><ul${$.attributes({ ...mergedProps() })}>`);
				children?.($$renderer);
				$$renderer.push(`<!----></ul></div> `);

				Mounted($$renderer, {
					get mounted() {
						return listState.wrapperMounted;
					},

					set mounted($$value) {
						listState.wrapperMounted = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { ref });
	});
}