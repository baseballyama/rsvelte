import * as $ from 'svelte/internal/server';

export default function Component2($$renderer, $$props) {
	const { state } = $$props;

	$$renderer.push(`<!---->${$.escape(state)}`);
}