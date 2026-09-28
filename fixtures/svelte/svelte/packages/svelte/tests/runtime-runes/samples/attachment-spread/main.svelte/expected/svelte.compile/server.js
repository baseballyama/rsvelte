import * as $ from 'svelte/internal/server';
import { createAttachmentKey } from 'svelte/attachments';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let stuff = { [createAttachmentKey()]: () => console.log('hello') };

		$$renderer.push(`<div${$.attributes({ ...stuff })}></div>`);
	});
}