import * as $ from 'svelte/internal/server';
import { createPageTitle } from '$doclib/util.js';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const title = $.derived(() => data.meta?.title?.[1]);

		$.head('1dqm967', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(createPageTitle(title() ? `fn ${title()}()` : 'Function'))}</title>`);
			});
		});

		if (data.content) {
			$$renderer.push('<!--[-->');
			data.content($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}