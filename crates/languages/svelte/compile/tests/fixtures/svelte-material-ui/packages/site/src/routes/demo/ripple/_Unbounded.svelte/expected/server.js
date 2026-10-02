import * as $ from 'svelte/internal/server';
import Ripple from '@smui/ripple';

export default function _Unbounded($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let rippleClasses = {};
		let primaryRippleClasses = {};
		let secondaryRippleClasses = {};

		$$renderer.push(`<p class="svelte-2ngptc"><span tabindex="0" role="button"${$.attr_class(`unbounded ${$.stringify(Object.keys(rippleClasses).join(' '))}`, 'svelte-2ngptc')}>D</span> <span tabindex="0" role="button"${$.attr_class(`unbounded ${$.stringify(Object.keys(primaryRippleClasses).join(' '))}`, 'svelte-2ngptc')}>P</span> <span tabindex="0" role="button"${$.attr_class(`unbounded ${$.stringify(Object.keys(secondaryRippleClasses).join(' '))}`, 'svelte-2ngptc')}>S</span></p>`);
	});
}