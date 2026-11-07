import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	const { 'kebab-case': rotisserie } = $$props;

	$$renderer.push(`<!---->${$.escape(rotisserie)}`);
}