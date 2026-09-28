import * as $ from 'svelte/internal/server';
import CodeMirror from "$lib";
import { javascript } from "@codemirror/lang-javascript";
import { typescriptValue } from "../_util/code";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const code = typescriptValue();

		CodeMirror($$renderer, {
			value: code,
			lang: javascript({ typescript: true }),
			class: 'editor'
		});
	});
}