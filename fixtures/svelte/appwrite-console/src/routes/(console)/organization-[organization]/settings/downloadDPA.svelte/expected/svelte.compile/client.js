import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, CardGrid } from '$lib/components';
import { Button } from '$lib/elements/forms';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackEvent } from '$lib/actions/analytics';

var root = $.from_html(
	`After downloading, have the DPA signed by your organization's compliance authority, such as your CEO
    or Compliance Manager, and submit it to <a class="link" href="mailto:privacy@appwrite.io">privacy@appwrite.io</a>.`,
	1
);

var root_1 = $.from_html(`<span class="icon-download" aria-hidden="true"></span> <span class="text">Download</span>`, 1);

var root_2 = $.from_html(
	`<h6><b>Data Processing Agreement (DPA)</b></h6> <p class="text u-margin-block-start-8">The DPA is a legal document that describes the roles and responsibilities of
                Appwrite and the organization when personal data is processed. <a class="link" target="_blank" rel="noopener noreferrer" href="https://appwrite.io/docs/advanced/security/gdpr#dpa">Learn more</a>.</p> <!>`,
	1
);

export default function DownloadDPA($$anchor, $$props) {
	$.push($$props, true);

	async function downloadPdf() {
		trackEvent(Submit.DownloadDPA);

		const today = new Date().toISOString();
		const prefs = await sdk.forConsole.account.getPrefs();
		const newPrefs = { ...prefs, DPA: today };

		sdk.forConsole.account.updatePrefs({ prefs: newPrefs });
	}

	CardGrid($$anchor, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text = $.text('DPA');

				$.append($$anchor, text);
			},

			aside: ($$anchor, $$slotProps) => {
				Box($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = root_2();
						var node = $.sibling($.first_child(fragment_3), 4);

						Button(node, {
							secondary: true,
							external: true,
							class: 'u-margin-block-start-16',
							get href() {
								return `${base ?? ''}/legal/dpa.pdf`;
							},
							event: 'download_dpa',
							$$events: { click: downloadPdf },
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = root_1();

								$.next(2);
								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			}
		}
	});

	$.pop();
}