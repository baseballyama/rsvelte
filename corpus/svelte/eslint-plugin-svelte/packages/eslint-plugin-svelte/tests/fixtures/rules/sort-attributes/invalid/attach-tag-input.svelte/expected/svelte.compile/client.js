import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div foo="">...</div>`);

export default function Attach_tag_input($$anchor) {
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