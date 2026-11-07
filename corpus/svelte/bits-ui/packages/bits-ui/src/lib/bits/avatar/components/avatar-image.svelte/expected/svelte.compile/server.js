import * as $ from 'svelte/internal/server';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { AvatarImageState } from "../avatar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

export default function Avatar_image($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const uid = $.props_id($$renderer);

		let {
			src,
			child,
			id = createId(uid),
			ref = null,
			crossorigin = undefined,
			referrerpolicy = undefined,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		const imageState = AvatarImageState.create({
			src: boxWith(() => src),
			id: boxWith(() => id),
			ref: boxWith(() => ref, (v) => ref = v),
			crossOrigin: boxWith(() => crossorigin),
			referrerPolicy: boxWith(() => referrerpolicy)
		});

		const mergedProps = $.derived(() => mergeProps(restProps, imageState.props));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push(`<!--[-1--><img${$.attributes({ ...mergedProps(), src })} onload="this.__e=event" onerror="this.__e=event"/>`);
		}

		$$renderer.push(`<!--]-->`);
		$.bind_props($$props, { ref });
	});
}