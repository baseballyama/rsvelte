import * as $ from 'svelte/internal/server';
import Icon from '$lib/components/global/Icon.svelte';

export default function WarningCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { title = 'Warning', warnings } = $$props;

		if (warnings.length > 0) {
			$$renderer.push(`<!--[0--><div class="card warning-card"><div class="card-content"><div class="warning-content">`);
			Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
			$$renderer.push(`<!----> <div class="warning-messages svelte-19c45l0">`);

			if (title) {
				$$renderer.push(`<!--[0--><strong>${$.escape(title)}</strong>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array = $.ensure_array_like(warnings);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let warning = each_array[$$index];

				$$renderer.push(`<p>${$.escape(warning)}</p>`);
			}

			$$renderer.push(`<!--]--></div></div></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}