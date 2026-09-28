import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PROJECT_NAME, SEO_DELIMITER } from '$lib/config';

var root = $.from_html(`<meta name="description"/> <meta name="keywords"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta property="og:title"/> <meta property="og:description"/>`, 1);

export default function Component_head($$anchor, $$props) {
	$.push($$props, true);

	const title = `${$$props.component.name} ${SEO_DELIMITER} ${$$props.component.directory} ${SEO_DELIMITER} ${PROJECT_NAME}`;
	const description = `Overview of the ${$$props.component.name} component from the ${$$props.component.directory} directory.`;
	const keywords = `svelte, component, ${$$props.component.name}, ${$$props.component.directory}, origin ui, tailwindcss, ui, library`;

	$.head('1u7oozv', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 2);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', description);
			$.set_attribute(meta_1, 'content', keywords);
			$.set_attribute(meta_2, 'content', title);
			$.set_attribute(meta_3, 'content', description);
			$.set_attribute(meta_4, 'content', title);
			$.set_attribute(meta_5, 'content', description);
		});

		$.deferred_template_effect(() => {
			$.document.title = title;
		});

		$.append($$anchor, fragment);
	});

	$.pop();
}