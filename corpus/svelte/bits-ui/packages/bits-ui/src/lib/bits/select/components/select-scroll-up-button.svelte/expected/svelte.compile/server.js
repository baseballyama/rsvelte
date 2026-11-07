import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SelectScrollUpButtonState } from "../select.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { Mounted } from "$lib/bits/utilities/index.js";

export default function Select_scroll_up_button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			delay = () => 50,
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const scrollButtonState = SelectScrollUpButtonState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			delay: boxWith(() => delay)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, scrollButtonState.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (scrollButtonState.canScrollUp) {
				$$renderer.push('<!--[0-->');

				Mounted($$renderer, {
					get mounted() {
						return scrollButtonState.scrollButtonState.mounted;
					},

					set mounted($$value) {
						scrollButtonState.scrollButtonState.mounted = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				if (child) {
					$$renderer.push('<!--[0-->');
					child($$renderer, { props: restProps });
					$$renderer.push(`<!---->`);
				} else {
					$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
					children?.($$renderer);
					$$renderer.push(`<!----></div>`);
				}

				$$renderer.push(`<!--]-->`);
			} else {
				$$renderer.push('<!--[-1-->');
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