import * as $ from 'svelte/internal/server';
import CodeMirror from "$lib";
import { javascript } from "@codemirror/lang-javascript";
import { javascriptValue } from "../_util/code";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const code = javascriptValue();

		CodeMirror($$renderer, { value: code, lang: javascript(), class: 'editor' });
	});
}