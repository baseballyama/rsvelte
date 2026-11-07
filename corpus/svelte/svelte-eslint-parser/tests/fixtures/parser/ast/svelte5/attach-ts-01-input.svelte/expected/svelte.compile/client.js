import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div>...</div>`);

export default function Attach_ts_01_input($$anchor) {
	const myAttachment = (element) => {
		console.log(element.nodeName); // 'DIV'

		return () => {
			console.log('cleaning up');
		};
	};

	var div = root();

	$.attach(div, () => myAttachment);
	$.append($$anchor, div);
}