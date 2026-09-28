import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { SelectItemState } from "../select.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { noop } from "$lib/internal/noop.js";
import Mounted from "$lib/bits/utilities/mounted.svelte";

export default function Select_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			id = createId(uid),
			ref = null,
			value,
			label = value,
			disabled = false,
			children,
			child,
			onHighlight = noop,
			onUnhighlight = noop,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const itemState = SelectItemState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			value: boxWith(() => value),
			disabled: boxWith(() => disabled),
			label: boxWith(() => label),
			onHighlight: boxWith(() => onHighlight),
			onUnhighlight: boxWith(() => onUnhighlight)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, itemState.props));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (child) {
				$$renderer.push('<!--[0-->');
				child($$renderer, { props: mergedProps(), ...itemState.snippetProps });
				$$renderer.push(`<!---->`);
			} else {
				$$renderer.push(`<!--[-1--><div${$.attributes({ ...mergedProps() })}>`);
				children?.($$renderer, itemState.snippetProps);
				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--> `);

			Mounted($$renderer, {
				get mounted() {
					return itemState.mounted;
				},

				set mounted($$value) {
					itemState.mounted = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
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