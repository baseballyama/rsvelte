import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createAttachmentKey } from 'svelte/attachments';

var root = $.from_html(`<div></div>`);

export default function Main($$anchor, $$props) {
	$.push($$props, true);

	let stuff = $.proxy({ [createAttachmentKey()]: () => console.log('hello') });
	var div = root();

	$.attribute_effect(div, () => ({ ...stuff }));
	$.append($$anchor, div);
	$.pop();
}