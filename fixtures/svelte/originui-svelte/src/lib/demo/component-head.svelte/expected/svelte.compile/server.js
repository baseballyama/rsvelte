import * as $ from 'svelte/internal/server';
import { PROJECT_NAME, SEO_DELIMITER } from '$lib/config';

export default function Component_head($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { component } = $$props;
		const title = `${component.name} ${SEO_DELIMITER} ${component.directory} ${SEO_DELIMITER} ${PROJECT_NAME}`;
		const description = `Overview of the ${component.name} component from the ${component.directory} directory.`;
		const keywords = `svelte, component, ${component.name}, ${component.directory}, origin ui, tailwindcss, ui, library`;

		$.head('1u7oozv', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(title)}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', description)}/> <meta name="keywords"${$.attr('content', keywords)}/> <meta name="twitter:title"${$.attr('content', title)}/> <meta name="twitter:description"${$.attr('content', description)}/> <meta property="og:title"${$.attr('content', title)}/> <meta property="og:description"${$.attr('content', description)}/>`);
		});
	});
}