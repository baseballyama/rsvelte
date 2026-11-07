import * as $ from 'svelte/internal/server';

export default function ToggleButton($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { pressed = void 0, label, onclick } = $$props;

		function clicked() {
			pressed = !pressed;
			onclick?.();
		}

		$$renderer.push(`<button${$.attr('aria-pressed', pressed ? 'true' : 'false')} class="svelte-1jvvy8z"><span style="display: none;">${$.escape(label)}</span></button>`);
		$.bind_props($$props, { pressed });
	});
}