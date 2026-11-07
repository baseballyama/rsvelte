import * as $ from 'svelte/internal/server';

export default function Mouse_position($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mouse = { x: 0, y: 0 };

		function onmousemove(e) {
			const rect = this.getBoundingClientRect();

			mouse.x = e.clientX - rect.left;
			mouse.y = e.clientY - rect.top;
		}

		$$renderer.push(`<div class="container svelte-1yst2r4">The mouse position is ${$.escape(mouse.x.toFixed())} x ${$.escape(mouse.y.toFixed())}</div>`);
	});
}