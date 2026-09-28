import * as $ from 'svelte/internal/server';
import { Box, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackEvent } from '$lib/actions/analytics';

export default function DownloadDPA($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		async function downloadPdf() {
			trackEvent(Submit.DownloadDPA);

			const today = new Date().toISOString();
			const prefs = await sdk.forConsole.account.getPrefs();
			const newPrefs = { ...prefs, DPA: today };

			sdk.forConsole.account.updatePrefs({ prefs: newPrefs });
		}

		CardGrid($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->After downloading, have the DPA signed by your organization's compliance authority, such as your CEO
    or Compliance Manager, and submit it to <a class="link" href="mailto:privacy@appwrite.io">privacy@appwrite.io</a>.`);
			},

			$$slots: {
				default: true,
				title: ($$renderer) => {
					{
						$$renderer.push(`DPA`);
					}
				},

				aside: ($$renderer) => {
					{
						Box($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<h6><b>Data Processing Agreement (DPA)</b></h6> <p class="text u-margin-block-start-8">The DPA is a legal document that describes the roles and responsibilities of
                Appwrite and the organization when personal data is processed. <a class="link" target="_blank" rel="noopener noreferrer" href="https://appwrite.io/docs/advanced/security/gdpr#dpa">Learn more</a>.</p> `);

								Button($$renderer, {
									secondary: true,
									external: true,
									class: 'u-margin-block-start-16',
									href: `${$.stringify(base)}/legal/dpa.pdf`,
									event: 'download_dpa',
									children: ($$renderer) => {
										$$renderer.push(`<span class="icon-download" aria-hidden="true"></span> <span class="text">Download</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					}
				}
			}
		});
	});
}