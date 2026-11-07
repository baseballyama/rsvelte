import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeMirror from "$lib";
import { javascript } from "@codemirror/lang-javascript";
import { typescriptValue } from "../_util/code";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const code = typescriptValue();

	{
		let $0 = $.derived(() => javascript({ typescript: true }));

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