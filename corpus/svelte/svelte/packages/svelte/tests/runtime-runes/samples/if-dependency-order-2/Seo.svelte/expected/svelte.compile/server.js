import * as $ from 'svelte/internal/server';

export default function Seo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { post } = $$props;

		$.head('ki78ts', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(post.title)}</title>`);
			});
		});

		$$renderer.push(`<p>${$.escape(post.title)}</p>`);
	});
}