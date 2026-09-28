import * as $ from 'svelte/internal/server';
import CodeMirror from "$lib";
import { css } from "@codemirror/lang-css";
import { cssValue } from "../_util/code";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const code = cssValue();

		CodeMirror($$renderer, { value: code, lang: css(), class: 'editor' });
	});
}