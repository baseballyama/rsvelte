import * as $ from 'svelte/internal/server';
import { fork } from "svelte";
import { createAttachmentKey } from "svelte/attachments";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let style = '';
		let attach = undefined;
		let forked;

		$$renderer.push(`<button>fork</button> <button>commit</button> <p${$.attributes({ ...{ style } })}>foo</p> <p${$.attributes({ ...{ style, [createAttachmentKey()]: attach } })}>foo</p> <p>foo</p>`);
	});
}