import * as $ from 'svelte/internal/server';
import './styles.css';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;

	children($$renderer);
	$$renderer.push(`<!---->`);
}