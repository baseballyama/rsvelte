import * as $ from 'svelte/internal/server';

export default function Head_template_title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { status, error } = $$props;
		$.head('14jc3f0', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(status)}: ${$.escape(error?.message)}</title>`);
			});
		});
	});
}
