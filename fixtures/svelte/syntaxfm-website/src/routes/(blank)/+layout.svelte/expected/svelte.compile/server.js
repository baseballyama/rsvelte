import * as $ from 'svelte/internal/server';
import '../(site)/style.css';
import 'media-chrome';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	children?.($$renderer);
	$$renderer.push(`<!---->`);
}