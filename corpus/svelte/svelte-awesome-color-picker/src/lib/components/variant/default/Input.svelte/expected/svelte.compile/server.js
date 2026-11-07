import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** DOM element of the label wrapper */
		/** hex color */
		/** input label */
		/** input name, useful in a native form */
		/** directionality left to right, or right to left*/
		let { labelElement = void 0, hex, label, name = undefined, dir } = $$props;

		function preventDefault(e) {
			e.preventDefault();

			/* prevent browser color picker from opening unless javascript is broken */
		}

		$$renderer.push(`<label${$.attr('dir', dir)} class="svelte-159r51c"><div class="container svelte-159r51c"><input type="color"${$.attr('name', name)}${$.attr('value', hex)} aria-haspopup="dialog" class="svelte-159r51c"/> <div class="alpha svelte-159r51c"></div> <div class="color svelte-159r51c"${$.attr_style('', { background: hex })}></div></div> ${$.escape(label)}</label>`);
		$.bind_props($$props, { labelElement });
	});
}