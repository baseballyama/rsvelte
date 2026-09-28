import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { LinkPreviewTriggerState } from "../link-preview.svelte.js";
import { createId } from "$lib/internal/create-id.js";
import { FloatingLayer } from "$lib/bits/utilities/floating-layer/index.js";

export default function Link_preview_trigger($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			ref = null,
			id = createId(uid),
			child,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const triggerState = LinkPreviewTriggerState.create({
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, triggerState.props));

		if (FloatingLayer.Anchor) {
			$$renderer.push('<!--[-->');

			FloatingLayer.Anchor($$renderer, {
				id,
				ref: triggerState.opts.ref,
				children: ($$renderer) => {
					if (child) {
						$$renderer.push('<!--[0-->');
						child($$renderer, { props: mergedProps() });
						$$renderer.push(`<!---->`);
					} else {
						$$renderer.push(`<!--[-1--><a${$.attributes({ ...mergedProps() })}>`);
						children?.($$renderer);
						$$renderer.push(`<!----></a>`);
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { ref });
	});
}