import * as $ from 'svelte/internal/server';
import { browser } from '$app/environment';

export default function Colors_in_js($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { colors = [['load', 'ing']] } = $$props;

		if (browser) {
			const wrapper = document.querySelector('.theme-wrapper');

			if (wrapper) {
				const variables = getComputedStyle(wrapper);

				colors = Object.values(variables).filter((value) => {
					return value.startsWith('--');
				}).map((variableName) => {
					return [variableName, variables.getPropertyValue(variableName)];
				});
			}
		}

		$$renderer.push(`<div><h2>Computed CSS Variables</h2> <!--[-->`);

		const each_array = $.ensure_array_like(colors);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [val, key] = each_array[$$index];

			$$renderer.push(`<p${$.attr_style('', { background: key })}>${$.escape(val)} ${$.escape(key)}</p>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { colors });
	});
}