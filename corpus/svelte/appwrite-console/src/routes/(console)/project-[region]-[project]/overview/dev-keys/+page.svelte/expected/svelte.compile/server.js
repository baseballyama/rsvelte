import * as $ from 'svelte/internal/server';
import { setOverviewAction } from '../context';
import Table from '../(components)/table.svelte';
import { Alert, Layout, Typography } from '@appwrite.io/pink-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		setOverviewAction(null);

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				gap: 'l',
				children: ($$renderer) => {
					if (Alert.Inline) {
						$$renderer.push('<!--[-->');

						Alert.Inline($$renderer, {
							status: 'warning',
							title: 'Dev keys are deprecated',
							children: ($$renderer) => {
								if (Typography.Text) {
									$$renderer.push('<!--[-->');

									Typography.Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->As of July 22, 2026, creating new dev keys is paused. Existing dev keys keep working
            until September 1, 2026. Learn more in the <a href="https://appwrite.io/changelog/entry/2026-07-22" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">changelog</a>.`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);
					Table($$renderer, { keys: data.devKeys, keyType: 'dev' });
					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}