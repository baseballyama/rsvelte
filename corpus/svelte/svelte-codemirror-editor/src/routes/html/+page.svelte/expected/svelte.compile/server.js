import * as $ from 'svelte/internal/server';
import CodeMirror from "$lib";
import { html } from "@codemirror/lang-html";
import { htmlValue } from "../_util/code";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const code = htmlValue();

		CodeMirror($$renderer, {
			value: code,
			lang: html({ matchClosingTags: true }),
			class: 'editor'
		});
	});
}