import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<h1>Demo App</h1> <button class="open-in-editor">edit main.svelte</button>`, 1);

export default function Main_template($$anchor) {
	function openInEditor() {
		fetch('./__open-in-editor?file=src/main.svelte');
	}

	var fragment = root();
	var button = $.sibling($.first_child(fragment), 2);

	$.event('click', button, openInEditor);
	$.append($$anchor, fragment);
}