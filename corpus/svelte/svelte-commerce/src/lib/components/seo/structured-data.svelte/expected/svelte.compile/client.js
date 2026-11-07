import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Structured_data($$anchor, $$props) {
	// JSON-LD emitter. JSON.stringify escapes quotes and backslashes but never the `<`
	// character, so any value containing a literal closing script tag (a merchant- or
	// vendor-authored description, a blog post body) ends the block early: broken structured
	// data plus unescaped markup in the document head. Escaping `<` to its unicode form is
	// valid JSON, parses back to the same string, and cannot break out.
	const json = $.derived(() => {
		if ($$props.schema === undefined || $$props.schema === null || $$props.schema === '') return '';

		const serialized = typeof $$props.schema === 'string' ? $$props.schema : JSON.stringify($$props.schema);

		return serialized ? serialized.replace(/</g, '\\u003c') : '';
	});

	$.head('1qwfd9g', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.html(node_1, () => `<script type="application/ld+json">${$.get(json)}</script>`);
				$.append($$anchor, fragment_1);
			};

			$.if(node, ($$render) => {
				if ($.get(json)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment);
	});
}