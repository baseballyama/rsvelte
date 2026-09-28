import * as $ from 'svelte/internal/server';
import { getInputId } from "./helpers/getInputId.js";

export default function Counter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			id,
			value = 0,
			step = 1,
			min = 0,
			max = Infinity,
			error = false,
			disabled = false,
			readonly = false,
			css = "",
			tooltip,
			onchange
		} = $$props;

		const inputId = getInputId(id);

		function dec() {
			if (readonly || value <= min) return;

			value -= step;
			onchange && onchange({ value });
		}

		function inc() {
			if (readonly || value >= max) return;

			value += step;
			onchange && onchange({ value });
		}

		function blur() {
			if (!readonly) {
				const tValue = Math.round(Math.min(max, Math.max(value, min)) / step) * step;

				value = isNaN(tValue) ? Math.max(min, 0) : tValue;
				onchange && onchange({ value });
			}
		}

		function input(e) {
			onchange && onchange({ value: e.target.value * 1, input: true });
		}

		$$renderer.push(`<div${$.attr_class(`wx-counter ${$.stringify(css)}`, 'svelte-x094r8', {
			'wx-disabled': disabled,
			'wx-readonly': readonly,
			'wx-error': error
		})}${$.attr('data-tooltip-text', tooltip)}><button aria-label="-" class="wx-btn wx-btn-dec svelte-x094r8"${$.attr('disabled', disabled, true)}><svg class="wx-dec svelte-x094r8" width="12" height="2" viewBox="0 0 12 2" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2501 1.74994H0.750092V0.249939H11.2501V1.74994Z"></path></svg></button> <input${$.attr('id', inputId)} type="text" class="wx-input svelte-x094r8"${$.attr('disabled', disabled, true)}${$.attr('readonly', readonly, true)} required=""${$.attr('value', value)}/> <button aria-label="-" class="wx-btn wx-btn-inc svelte-x094r8"${$.attr('disabled', disabled, true)}><svg class="wx-inc svelte-x094r8" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2501
                6.74994H6.75009V11.2499H5.25009V6.74994H0.750092V5.24994H5.25009V0.749939H6.75009V5.24994H11.2501V6.74994Z"></path></svg></button></div>`);

		$.bind_props($$props, { value });
	});
}