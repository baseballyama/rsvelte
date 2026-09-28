import * as $ from 'svelte/internal/server';
import "../layout.css";
import "../kener.css";
import "../docs.css";
import "../prose.css";
import "highlight.js/styles/github-dark.css";
import { ModeWatcher } from "mode-watcher";
import { resolve } from "$app/paths";
import { Toaster } from "$lib/components/ui/sonner/index.js";

export default function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let base = resolve("/");
		let { children, data } = $$props;

		ModeWatcher($$renderer, {});
		$$renderer.push(`<!----> `);
		Toaster($$renderer, {});
		$$renderer.push(`<!----> <main>`);
		children($$renderer);
		$$renderer.push(`<!----></main>`);
	});
}