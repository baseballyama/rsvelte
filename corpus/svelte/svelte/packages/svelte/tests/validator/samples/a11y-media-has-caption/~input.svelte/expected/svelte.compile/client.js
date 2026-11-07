import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<video src="x"><track kind="captions"/></video> <video src="x"></video> <video src="x"><track/></video> <audio></audio> <video src="x" aria-hidden="true"></video> <video src="x" aria-hidden="false"></video> <video></video>`, 3);

export default function Input($$anchor) {
	var fragment = root();

	$.next(12);
	$.append($$anchor, fragment);
}