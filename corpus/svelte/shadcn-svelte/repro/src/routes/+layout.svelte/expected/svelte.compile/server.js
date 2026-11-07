import * as $ from 'svelte/internal/server';
import "../app.css";
import { ModeWatcher } from "mode-watcher";
import favicon from "$lib/assets/favicon.svg";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	$.head('my0bv4', $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="icon"${$.attr('href', favicon)}/>`);
	});

	ModeWatcher($$renderer, {});
	$$renderer.push(`<!----> `);
	children?.($$renderer);
	$$renderer.push(`<!---->`);
}