import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><video autoplay="" class="svelte-12850dk"></video> <video></video></div>`, 2);

export default function Input($$anchor) {
	var div = root();
	var video = $.child(div);

	video.muted = true;

	var video_1 = $.sibling(video, 2);

	video_1.muted = true;
	$.reset(div);
	$.append($$anchor, div);
}