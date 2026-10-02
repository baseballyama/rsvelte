import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MediaExtended from './MediaExtended.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<video preload="none" playsinline="" controls=""></video>`, 2);

export default function VideoExtended($$anchor, $$props) {
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
			var video = root();

			$.bind_this(video, ($$value) => $.set(mediaRef, $$value), () => $.get(mediaRef));

			$.template_effect(() => {
				$.set_attribute(video, 'src', $.get(node).attrs.src);
				$.set_attribute(video, 'title', $.get(node).attrs.title);
			});

			$.append($$anchor, video);
		},
		$$slots: { default: true }
	}));

	$.pop();
}