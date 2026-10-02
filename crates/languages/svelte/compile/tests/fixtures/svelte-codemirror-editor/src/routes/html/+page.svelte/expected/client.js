import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CodeMirror from "$lib";
import { html } from "@codemirror/lang-html";
import { htmlValue } from "../_util/code";

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const code = htmlValue();

	{
		let $0 = $.derived(() => html({ matchClosingTags: true }));

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