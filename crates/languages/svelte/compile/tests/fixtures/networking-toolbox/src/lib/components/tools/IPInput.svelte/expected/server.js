import * as $ from 'svelte/internal/server';
import { validateIPv4 } from '$lib/utils/ip-validation.js';
import SvgIcon from '$lib/components/global/SvgIcon.svelte';

export default function IPInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = '',
			placeholder = '192.168.1.1',
			label = 'IP Address',
			required = false,
			disabled = false,
			class: className = ''
		} = $$props;

		let validation = { valid: true };
		let focused = false;

		/**
		 * Validates input on change
		 */
		function handleInput(event) {
			const target = event.target;

			value = target.value;
			validation = validateIPv4(value);
		}

		/**
		 * Formats IP address as user types
		 */
		function _formatIP(ip) {
			return ip.replace(/[^0-9.]/g, '');
		}

		$$renderer.push(`<div${$.attr_class(`form-field ${$.stringify(className)}`, 'svelte-pg6h27')}>`);

		if (label) {
			$$renderer.push(`<!--[0--><label for="ip-input">${$.escape(label)} `);

			if (required) {
				$$renderer.push(`<!--[0--><span class="required">*</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="field-input"><input id="ip-input" type="text"${$.attr('value', value)}${$.attr('placeholder', placeholder)}${$.attr('required', required, true)}${$.attr('disabled', disabled, true)}${$.attr_class('input-ip svelte-pg6h27', void 0, {
			'valid': validation.valid && value,
			'invalid': !validation.valid && value,
			'focused': focused
		})}/> <div class="field-icon">`);

		if (value && validation.valid) {
			$$renderer.push(`<!--[0--><div class="status-icon success">`);
			SvgIcon($$renderer, { icon: 'check', size: 'sm' });
			$$renderer.push(`<!----></div>`);
		} else if (value && !validation.valid) {
			$$renderer.push(`<!--[1--><div class="status-icon error">`);
			SvgIcon($$renderer, { icon: 'close', size: 'sm' });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div></div> `);

		if (!validation.valid && validation.error) {
			$$renderer.push(`<!--[0--><p class="field-error fade-in">${$.escape(validation.error)}</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (validation.valid && value) {
			$$renderer.push(`<!--[0--><p class="field-help">Valid IPv4 address format</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
		$.bind_props($$props, { value });
	});
}