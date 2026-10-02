import * as $ from 'svelte/internal/server';

export default function TextInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/** if set to false, disables the alpha channel */
		/** rgb color */
		/** hsv color */
		/** hex color */
		/** configure which hex, rgb and hsv inputs will be visible and in which order. If overridden, it is necessary to provide at least one value */
		/** all translation tokens used in the library; can be partially overridden; see [full object type](https://github.com/Ennoriel/svelte-awesome-color-picker/blob/master/src/lib/utils/texts.ts) */
		/** listener, dispatch an event when one of the color changes */
		let {
			isAlpha,
			rgb = void 0,
			hsv = void 0,
			hex = void 0,
			textInputModes,
			texts,
			onInput
		} = $$props;

		const HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{8})$/i;
		let mode = $.derived(() => textInputModes[0] || 'hex');
		let nextMode = $.derived(() => textInputModes[(textInputModes.indexOf(mode()) + 1) % textInputModes.length]);
		let h = $.derived(() => Math.round(hsv.h));
		let s = $.derived(() => Math.round(hsv.s));
		let v = $.derived(() => Math.round(hsv.v));
		let a = $.derived(() => hsv.a === undefined ? 1 : Math.round(hsv.a * 100) / 100);

		function updateHex(e) {
			const target = e.target;

			if (HEX_COLOR_REGEX.test(target.value)) {
				hex = target.value;
				onInput({ hex });
			}
		}

		function updateRgb(property) {
			return function (e) {
				let value = parseFloat(e.target.value);

				rgb = { ...rgb, [property]: isNaN(value) ? 0 : value };
				onInput({ rgb });
			};
		}

		function updateHsv(property) {
			return function (e) {
				let value = parseFloat(e.target.value);

				hsv = { ...hsv, [property]: isNaN(value) ? 0 : value };
				onInput({ hsv });
			};
		}

		$$renderer.push(`<div class="text-input svelte-12x11tl"><div class="input-container svelte-12x11tl">`);

		if (mode() === 'hex') {
			$$renderer.push(`<!--[0--><input${$.attr('aria-label', texts.label.hex)}${$.attr('value', hex)} class="svelte-12x11tl"${$.attr_style('', { flex: 3 })}/>`);
		} else if (mode() === 'rgb') {
			$$renderer.push(`<!--[1--><input${$.attr('aria-label', texts.label.r)}${$.attr('value', rgb.r)} type="number" min="0" max="255" class="svelte-12x11tl"/> <input${$.attr('aria-label', texts.label.g)}${$.attr('value', rgb.g)} type="number" min="0" max="255" class="svelte-12x11tl"/> <input${$.attr('aria-label', texts.label.b)}${$.attr('value', rgb.b)} type="number" min="0" max="255" class="svelte-12x11tl"/>`);
		} else {
			$$renderer.push(`<!--[-1--><input${$.attr('aria-label', texts.label.h)}${$.attr('value', h())} type="number" min="0" max="360" class="svelte-12x11tl"/> <input${$.attr('aria-label', texts.label.s)}${$.attr('value', s())} type="number" min="0" max="100" class="svelte-12x11tl"/> <input${$.attr('aria-label', texts.label.v)}${$.attr('value', v())} type="number" min="0" max="100" class="svelte-12x11tl"/>`);
		}

		$$renderer.push(`<!--]--> `);

		if (isAlpha) {
			$$renderer.push(`<!--[0--><input${$.attr('aria-label', texts.label.a)}${$.attr('value', a())} type="number" min="0" max="1" step="0.01" class="svelte-12x11tl"/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (textInputModes.length > 1) {
			$$renderer.push(`<!--[0--><button type="button" class="svelte-12x11tl"><span class="disappear svelte-12x11tl" aria-hidden="true">${$.escape(texts.color[mode()])}</span> <span class="appear svelte-12x11tl">${$.escape(texts.changeTo)} ${$.escape(texts.color[nextMode()])}</span></button>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="button-like svelte-12x11tl">${$.escape(texts.color[mode()])}</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { rgb, hsv, hex });
	});
}