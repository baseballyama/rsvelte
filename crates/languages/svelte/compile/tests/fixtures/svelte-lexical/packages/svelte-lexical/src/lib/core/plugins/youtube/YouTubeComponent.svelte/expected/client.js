import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BlockWithAlignableContents from '../BlockWithAlignableContents.svelte';

var root = $.from_html(`<iframe width="560" height="315" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="YouTube video"></iframe>`);

export default function YouTubeComponent($$anchor, $$props) {
	BlockWithAlignableContents($$anchor, {
		get className() {
			return $$props.className;
		},

		get format() {
			return $$props.format;
		},

		get nodeKey() {
			return $$props.nodeKey;
		},

		children: ($$anchor, $$slotProps) => {
			var iframe = root();

			iframe.allowFullscreen = true;
			$.template_effect(() => $.set_attribute(iframe, 'src', `https://www.youtube-nocookie.com/embed/${$$props.videoID}`));
			$.append($$anchor, iframe);
		},
		$$slots: { default: true }
	});
}