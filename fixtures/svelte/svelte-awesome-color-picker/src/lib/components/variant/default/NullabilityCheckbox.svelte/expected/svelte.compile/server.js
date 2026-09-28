import * as $ from 'svelte/internal/server';

export default function NullabilityCheckbox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** whether the color picker is undefined */
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		let { isUndefined = void 0, texts } = $$props;

		$$renderer.push(`<label class="nullability-checkbox svelte-16zqh08"><div class="svelte-16zqh08"><input type="checkbox"${$.attr('checked', isUndefined, true)} class="svelte-16zqh08"/> <span class="svelte-16zqh08"></span></div> ${$.escape(texts.label.withoutColor)}</label>`);
		$.bind_props($$props, { isUndefined });
	});
}