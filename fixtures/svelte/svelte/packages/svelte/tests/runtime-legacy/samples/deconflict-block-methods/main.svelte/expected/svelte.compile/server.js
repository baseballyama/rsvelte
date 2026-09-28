import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const create = 'deconflicted';

	$$renderer.push(`<div>deconflicted</div>`);
}