import * as $ from 'svelte/internal/server';

import { ssrLooseContain, ssrLooseEqual, ssrIncludeBooleanAttr } from 'vue/server-renderer';

import { toDisplayString } from 'vue';

export default function Form_controls_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function renderable(value) {
			return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : undefined;
		}
		let size = 'm';
		let note = 'none';
		$$renderer.push(`<select class="size">`);
		$$renderer.option({ value: 's', selected: ssrIncludeBooleanAttr(Array.isArray(size) ? ssrLooseContain(size, 's') : ssrLooseEqual(size, 's')) }, ($$renderer) => {
			$$renderer.push(`small`);
		});
		$$renderer.option({ value: 'm', selected: ssrIncludeBooleanAttr(Array.isArray(size) ? ssrLooseContain(size, 'm') : ssrLooseEqual(size, 'm')) }, ($$renderer) => {
			$$renderer.push(`medium`);
		});
		$$renderer.option({ value: 'l', selected: ssrIncludeBooleanAttr(Array.isArray(size) ? ssrLooseContain(size, 'l') : ssrLooseEqual(size, 'l')) }, ($$renderer) => {
			$$renderer.push(`large`);
		});
		$$renderer.push(`</select><input class="note"${$.attr('value', renderable(note))}/><p class="summary">size ${$.escape(toDisplayString(size))}, note ${$.escape(toDisplayString(note))}</p>`);
	});
}
