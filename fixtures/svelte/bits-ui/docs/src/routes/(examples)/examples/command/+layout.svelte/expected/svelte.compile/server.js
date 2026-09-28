import * as $ from 'svelte/internal/server';
import "$lib/styles/command/globals.css";
import "$lib/styles/command/icons.css";
import "$lib/styles/command/command.css";

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}