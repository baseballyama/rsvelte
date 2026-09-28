import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import 'lite-youtube-embed/src/lite-yt-embed.css';

export default function Youtube($$anchor, $$props) {
	$.push($$props, true);

	// @ts-ignore
	$.user_effect(async () => {
		await import('lite-youtube-embed');
	});

	$.pop();
}