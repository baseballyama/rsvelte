import * as $ from 'svelte/internal/server';

import { normalizeClass, toDisplayString } from 'vue';

export default function Props_vue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { label: label = 'Count', start: start = 0, step: step = 1, $$slots, $$events, ...rest } = $$props;
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
		let count = start;
		$$renderer.push(`<button${$.attributes({ ...attrs(), class: $.clsx('class' in attrs() ? normalizeClass(['bump', attrs().class]) : 'bump') })}>${$.escape(toDisplayString(label))}: ${$.escape(toDisplayString(count))}</button>`);
	});
}
