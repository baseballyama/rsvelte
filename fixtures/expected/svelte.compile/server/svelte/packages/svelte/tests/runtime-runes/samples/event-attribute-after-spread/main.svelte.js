import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const props = {};
	let changed = false;

	$$renderer.push(`<!---->${$.escape(changed)} <input${$.attributes({ ...props, class: 'hello' }, void 0, void 0, void 0, 4)}/>`);
}