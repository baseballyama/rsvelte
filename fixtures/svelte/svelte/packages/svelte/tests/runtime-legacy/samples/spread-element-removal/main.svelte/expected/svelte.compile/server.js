import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<input${$.attributes({ placeholder: 'foo', ...{ placeholder: null } }, void 0, void 0, void 0, 4)}/>`);
}