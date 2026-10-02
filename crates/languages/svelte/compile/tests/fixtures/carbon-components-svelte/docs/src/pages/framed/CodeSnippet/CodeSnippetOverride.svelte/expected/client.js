import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CodeSnippet } from "carbon-components-svelte";
import copy from "clipboard-copy";

export default function CodeSnippetOverride($$anchor, $$props) {
	$.push($$props, true);

	CodeSnippet($$anchor, {
		code: 'npm i carbon-components-svelte',
		copy: (text) => copy(text)
	});

	$.pop();
}