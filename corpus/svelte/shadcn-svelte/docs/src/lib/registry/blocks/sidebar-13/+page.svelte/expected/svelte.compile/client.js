import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SettingsDialog from "./components/settings-dialog.svelte";

var root = $.from_html(`<div class="flex h-svh items-center justify-center"><!></div>`);

export default function _page($$anchor) {
	var div = root();
	var node = $.child(div);

	SettingsDialog(node, {});
	$.reset(div);
	$.append($$anchor, div);
}