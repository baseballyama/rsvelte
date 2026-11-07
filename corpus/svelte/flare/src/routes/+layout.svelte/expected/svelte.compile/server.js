import * as $ from 'svelte/internal/server';
import '@fontsource-variable/inter';
import '../app.css';
import { ModeWatcher } from 'mode-watcher';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	ModeWatcher($$renderer, {});
	$$renderer.push(`<!----> `);
	children($$renderer);
	$$renderer.push(`<!---->`);
}