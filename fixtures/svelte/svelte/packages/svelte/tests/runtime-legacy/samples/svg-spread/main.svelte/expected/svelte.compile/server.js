import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const style = {
		fill: '#ff0000',
		x: '50',
		y: '50',
		width: '100',
		height: '75'
	};

	$$renderer.push(`<svg width="400" height="400"><rect${$.attributes({ ...style }, void 0, void 0, void 0, 3)}></rect></svg>`);
}