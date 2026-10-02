import * as $ from 'svelte/internal/server';

export default function Ts_basic_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// fix: https://github.com/sveltejs/eslint-plugin-svelte/issues/1028#issuecomment-2728101827
		const { myObjectProp } = $$props;

		$$renderer.push(`<p>${$.escape(myObjectProp.value)} ${$.escape(myObjectProp.value2)}</p>`);
	});
}