import * as $ from 'svelte/internal/server';
import { CodeSnippet } from "carbon-components-svelte";
import copy from "clipboard-copy";

export default function CodeSnippetOverride($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		CodeSnippet($$renderer, {
			code: 'npm i carbon-components-svelte',
			copy: (text) => copy(text)
		});
	});
}