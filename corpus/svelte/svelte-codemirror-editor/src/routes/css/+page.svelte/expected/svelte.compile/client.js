import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeMirror from "$lib";
import { css } from "@codemirror/lang-css";
import { cssValue } from "../_util/code";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const code = cssValue();

	{
		let $0 = $.derived(css);

		CodeMirror($$anchor, {
			get value() {
				return code;
			},

			get lang() {
				return $.get($0);
			},
			class: 'editor'
		});
	}

	$.pop();
}