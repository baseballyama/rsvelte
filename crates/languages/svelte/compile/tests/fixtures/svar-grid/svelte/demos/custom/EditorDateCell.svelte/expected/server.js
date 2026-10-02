import * as $ from 'svelte/internal/server';

export default function EditorDateCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		if (data) {
			$$renderer.push(`<!--[0--><div class="date svelte-l1v42m"><i class="wxi-calendar svelte-l1v42m"></i> <span>${$.escape(data.toLocaleDateString())}</span></div>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="empty svelte-l1v42m">no date</span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}