import * as $ from 'svelte/internal/server';

export default function EditorSelectCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		if (data) {
			$$renderer.push(`<!--[0--><div class="container svelte-1yvh7he"><div class="avatar svelte-1yvh7he"><span class="svelte-1yvh7he">${$.escape(data.label[0])}</span></div> <span class="name">${$.escape(data.label)}</span></div>`);
		} else {
			$$renderer.push(`<!--[-1--><span class="empty svelte-1yvh7he">not selected</span>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}