import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { hi, hi2: hi_2, hi3 }) => {
				$$renderer.push(`<!---->${$.escape(hi)}${$.escape(hi_2)}${$.escape(hi3)}`);
			}
		}
	});
}