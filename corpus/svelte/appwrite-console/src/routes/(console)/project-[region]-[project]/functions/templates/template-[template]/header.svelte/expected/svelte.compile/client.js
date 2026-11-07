import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Id } from '$lib/components';
import { Cover, CoverTitle } from '$lib/layout';
import { template } from './store';

var root = $.from_html(`<!> <!>`, 1);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $template = () => $.store_get(template, '$template', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	Cover($$anchor, {
		$$slots: {
			header: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${page.params.project}/functions/templates`);

					CoverTitle(node, {
						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $template().name));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}

				var node_1 = $.sibling(node, 2);

				Id(node_1, {
					get value() {
						return $template().id;
					},
					event: 'user',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text();

						$.template_effect(() => $.set_text(text_1, $template().id));
						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	$.pop();
	$$cleanup();
}