import * as $ from 'svelte/internal/server';
import SettingsDialog from "./components/settings-dialog.svelte";

export default function _page($$renderer) {
	$$renderer.push(`<div class="flex h-svh items-center justify-center">`);
	SettingsDialog($$renderer, {});
	$$renderer.push(`<!----></div>`);
}