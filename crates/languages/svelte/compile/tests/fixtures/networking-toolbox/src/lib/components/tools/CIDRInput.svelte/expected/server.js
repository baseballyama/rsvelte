import * as $ from 'svelte/internal/server';
import { validateCIDR } from '$lib/utils/ip-validation.js';
import Tooltip from '$lib/components/global/Tooltip.svelte';
import SvgIcon from '$lib/components/global/SvgIcon.svelte';

export default function CIDRInput($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value = '',
			placeholder = '192.168.1.0/24',
			label = 'CIDR Notation',
			required = false,
			disabled = false,
			class: className = ''
		} = $$props;

		let validation = { valid: true };
		let focused = false;

		/**
		 * Quick CIDR presets
		 */
		const cidrPresets = [
			{ cidr: 8, label: '/8', hosts: '16M hosts' },
			{ cidr: 16, label: '/16', hosts: '65K hosts' },
			{ cidr: 24, label: '/24', hosts: '254 hosts' },
			{ cidr: 25, label: '/25', hosts: '126 hosts' },
			{ cidr: 26, label: '/26', hosts: '62 hosts' },
			{ cidr: 27, label: '/27', hosts: '30 hosts' },
			{ cidr: 28, label: '/28', hosts: '14 hosts' },
			{ cidr: 30, label: '/30 (P2P)', hosts: '2 hosts' }
		];

		/**
		 * Check if current value matches a preset
		 */
		function getActivePreset() {
			if (!value || !value.includes('/')) return null;

			const currentCidr = parseInt(value.split('/')[1], 10);

			return cidrPresets.find((p) => p.cidr === currentCidr)?.cidr || null;
		}

		// Derive active preset from current value
		const activePreset = $.derived(getActivePreset);

		/**
		 * Validates CIDR input on change
		 */
		function handleInput(event) {
			const target = event.target;

			value = target.value;
			validation = validateCIDR(value);
		}

		/**
		 * Applies CIDR preset
		 */
		function applyPreset(cidr) {
			if (value && value.includes('/')) {
				const ip = value.split('/')[0];

				value = `${ip}/${cidr}`;
			} else if (value) {
				value = `${value}/${cidr}`;
			}

			validation = validateCIDR(value);
		}

		$$renderer.push(`<div${$.attr_class(`form-field ${$.stringify(className)}`, 'svelte-zkysce')}>`);

		if (label) {
			$$renderer.push(`<!--[0--><label for="cidr-input">${$.escape(label)} `);

			if (required) {
				$$renderer.push(`<!--[0--><span class="required">*</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></label>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="field-input"><input id="cidr-input" type="text"${$.attr('value', value)}${$.attr('placeholder', placeholder)}${$.attr('required', required, true)}${$.attr('disabled', disabled, true)}${$.attr_class('input-cidr svelte-zkysce', void 0, {
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

		$$renderer.push(`<!--]--> <div class="presets-section svelte-zkysce"><p class="presets-label svelte-zkysce">Quick presets:</p> <div class="presets-grid svelte-zkysce"><!--[-->`);

		const each_array = $.ensure_array_like(cidrPresets);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let preset = each_array[$$index];

			Tooltip($$renderer, {
				text: `Apply ${$.stringify(preset.label)} - ${$.stringify(preset.hosts)}`,
				position: 'top',
				children: ($$renderer) => {
					$$renderer.push(`<button type="button"${$.attr_class(`preset-btn ${activePreset() === preset.cidr ? 'active' : ''}`, 'svelte-zkysce')}${$.attr('disabled', disabled, true)}${$.attr('aria-label', `Apply ${$.stringify(preset.label)} preset with ${$.stringify(preset.hosts)}`)}>${$.escape(preset.label)}</button>`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]--></div></div></div>`);
		$.bind_props($$props, { value });
	});
}