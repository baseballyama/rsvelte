import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { page } from '$app/state';
import { Cover, CoverTitle } from '$lib/layout';
import { platform } from './store';

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $platform = () => $.store_get(platform, '$platform', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const projectId = page.params.project;

	Cover($$anchor, {
		$$slots: {
			header: ($$anchor, $$slotProps) => {
				{
					let $0 = $.derived(() => `${base}/project-${page.params.region}-${projectId}/overview/platforms`);

					CoverTitle($$anchor, {
						get href() {
							return $.get($0);
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $platform()?.name));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				}
			}
		}
	});

	$.pop();
	$$cleanup();
}