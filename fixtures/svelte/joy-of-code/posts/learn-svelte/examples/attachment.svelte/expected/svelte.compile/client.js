import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="container"><div class="box svelte-dfd248"></div></div>`);

export default function Attachment($$anchor) {
	var div = root();
	var div_1 = $.child(div);

	$.attach(div_1, () => (box) => {
		window.gsap.to(box, { rotation: 360, x: 200, duration: 2 });
	});

	$.reset(div);
	$.append($$anchor, div);
}