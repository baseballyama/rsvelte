import * as $ from 'svelte/internal/server';

import { normalizeClass, toDisplayString } from 'vue';

export default function Boolean_prop_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		let flag = $.derived(() => {
			let value = rest.flag;
			if (!('flag' in rest)) return false;
			if (value === '' || value === 'flag') return true;
			return value;
		});
		let shown = $.derived(() => {
			let value_1 = rest.shown;
			if (!('shown' in rest)) return false;
			if (value_1 === '' || value_1 === 'shown') return true;
			return value_1;
		});
		let attrs = $.derived(() => {
			const fallthrough = { ...rest };
			delete fallthrough['flag'];
			delete fallthrough['shown'];
			delete fallthrough[''];
			delete fallthrough['key'];
			delete fallthrough['ref'];
			delete fallthrough['ref_for'];
			delete fallthrough['ref_key'];
			delete fallthrough['onVnodeBeforeMount'];
			delete fallthrough['onVnodeMounted'];
			delete fallthrough['onVnodeBeforeUpdate'];
			delete fallthrough['onVnodeUpdated'];
			delete fallthrough['onVnodeBeforeUnmount'];
			delete fallthrough['onVnodeUnmounted'];
			return fallthrough;
		});
		$$renderer.push(`<p${$.attributes({ ...'class' in attrs() ? { ...attrs(), class: normalizeClass([attrs().class]) } : attrs() })}>flag ${$.escape(toDisplayString(String(flag())))}, shown ${$.escape(toDisplayString(String(shown())))}</p>`);
	});
}
