import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<video></video>`, 2);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let srcObject = $.state(void 0);

	$.user_effect(() => {
		$.set(srcObject, {}, true);
	});

	var video = root();

	$.template_effect(() => video.srcObject = $.get(srcObject));
	$.append($$anchor, video);
	$.pop();
}