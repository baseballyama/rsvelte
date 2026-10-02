import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Badge, Center, Title, Box } from '@svelteuidev/core';
import { base } from '$app/paths';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<a class="logoEl svelte-gpyk3a"><!></a>`);

export default function Logo($$anchor) {
	const override = { gap: '0.5rem' };
	const title = { fontFamily: 'var(--font)' };
	var a = root_1();
	var node = $.child(a);

	Center(node, {
		get override() {
			return override;
		},
		inline: true,
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Box(node_1, {
				css: { d: 'flex' },
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					Title(node_2, {
						get override() {
							return title;
						},
						order: 2,
						inline: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Svelte');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Title(node_3, {
						get override() {
							return title;
						},
						order: 2,
						inline: true,
						color: 'blue',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('UI');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_1, 2);

			Badge(node_4, {
				override: { display: 'inline-block' },
				variant: 'outline',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Beta');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(a);
	$.template_effect(() => $.set_attribute(a, 'href', `${base ?? ''}/`));
	$.append($$anchor, a);
}