import * as $ from 'svelte/internal/server';
import BlockWithAlignableContents from '../BlockWithAlignableContents.svelte';

export default function YouTubeComponent($$renderer, $$props) {
	let { className, format, nodeKey, videoID } = $$props;

	BlockWithAlignableContents($$renderer, {
		className,
		format,
		nodeKey,
		children: ($$renderer) => {
			$$renderer.push(`<iframe width="560" height="315"${$.attr('src', `https://www.youtube-nocookie.com/embed/${videoID}`)} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"${$.attr('allowfullscreen', true, true)} title="YouTube video"></iframe>`);
		},
		$$slots: { default: true }
	});
}