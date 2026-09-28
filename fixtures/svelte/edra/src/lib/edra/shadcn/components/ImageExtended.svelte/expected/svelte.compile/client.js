import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MediaExtended from './MediaExtended.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<img class="m-0 object-cover"/>`);

export default function ImageExtended($$anchor, $$props) {
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
			var img = root();

			$.bind_this(img, ($$value) => $.set(mediaRef, $$value), () => $.get(mediaRef));

			$.template_effect(() => {
				$.set_attribute(img, 'src', $.get(node).attrs.src);
				$.set_attribute(img, 'alt', $.get(node).attrs.alt);
				$.set_attribute(img, 'title', $.get(node).attrs.title);
			});

			$.append($$anchor, img);
		},
		$$slots: { default: true }
	}));

	$.pop();
}