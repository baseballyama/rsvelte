import * as $ from 'svelte/internal/server';

import { ssrLooseContain, ssrIncludeBooleanAttr } from 'vue/server-renderer';

import { toDisplayString } from 'vue';

export default function Checkbox_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let agreed = false;
		$$renderer.push(`<label><input type="checkbox" class="agree"${$.attr('checked', ssrIncludeBooleanAttr(Array.isArray(agreed) ? ssrLooseContain(agreed, null) : agreed), true)}/> I agree</label><p class="status">${$.escape(toDisplayString(agreed ? 'agreed' : 'not yet'))}</p><button class="submit"${$.attr('disabled', ssrIncludeBooleanAttr(!agreed), true)}>continue</button>`);
	});
}
