import * as $ from 'svelte/internal/server';

import { normalizeClass } from 'vue';

export default function Fallthrough_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...rest } = $$props;
		let attrs = $.derived(() => {
			const fallthrough = { ...rest };
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
		$$renderer.push(`<p${$.attributes({ ...attrs(), class: $.clsx('class' in attrs() ? normalizeClass(['inner', attrs().class]) : 'inner') })}>root</p>`);
	});
}
