import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MediaExtended from './MediaExtended.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<iframe></iframe>`);

export default function IFrame($$anchor, $$props) {
	$.push($$props, true);

	const rest = $.rest_props($$props, rest_excludes);
	let mediaRef = $.state(void 0);

	MediaExtended($$anchor, $.spread_props(() => rest, {
		get mediaRef() {
			return $.get(mediaRef);
		},

		set mediaRef($$value) {
			$.set(mediaRef, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			const node = $.derived(() => $$props.node);
			var iframe = root();

			$.attribute_effect(iframe, () => ({ class: 'm-0 w-full', ...$.get(node).attrs }));
			$.bind_this(iframe, ($$value) => $.set(mediaRef, $$value), () => $.get(mediaRef));
			$.replay_events(iframe);
			$.append($$anchor, iframe);
		},
		$$slots: { default: true }
	}));

	$.pop();
}