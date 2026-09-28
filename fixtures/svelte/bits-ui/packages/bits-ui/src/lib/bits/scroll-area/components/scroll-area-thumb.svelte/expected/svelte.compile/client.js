import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ScrollAreaScrollbarVisibleContext } from "../scroll-area.svelte.js";
import ScrollAreaThumbImpl from "./scroll-area-thumb-impl.svelte";
import { createId } from "$lib/internal/create-id.js";
import PresenceLayer from "$lib/bits/utilities/presence-layer/presence-layer.svelte";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'id', 'ref', 'forceMount']);

export default function Scroll_area_thumb($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, () => createId(uid)),
		ref = $.prop($$props, 'ref', 15, null),
		forceMount = $.prop($$props, 'forceMount', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const scrollbarState = ScrollAreaScrollbarVisibleContext.get();

	{
		const presence = ($$anchor, $$arg0) => {
			let present = () => ($$arg0?.()).present;

			ScrollAreaThumbImpl($$anchor, $.spread_props(() => restProps, {
				get id() {
					return id();
				},

				get present() {
					return present();
				},

				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				}
			}));
		};

		let $0 = $.derived(() => forceMount() || scrollbarState.hasThumb);

		PresenceLayer($$anchor, {
			get open() {
				return $.get($0);
			},

			get ref() {
				return scrollbarState.scrollbar.opts.ref;
			},
			presence,
			$$slots: { presence: true }
		});
	}

	$.pop();
}