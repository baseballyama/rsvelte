import * as $ from 'svelte/internal/server';
import { WizardStep } from '$lib/layout';
import { app } from '$lib/stores/app';
import imgDark from '$lib/images/feedback/feedback-dark.svg';
import imgLight from '$lib/images/feedback/feedback-light.svg';

export default function Step2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		WizardStep($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="u-flex u-main-center">`);

				if ($.store_get($$store_subs ??= {}, '$app', app).themeInUse === 'dark') {
					$$renderer.push(`<!--[0--><img${$.attr('src', imgDark)} alt="" class="u-only-dark"/>`);
				} else {
					$$renderer.push(`<!--[-1--><img${$.attr('src', imgLight)} alt="" class="u-only-light"/>`);
				}

				$$renderer.push(`<!--]--></div>`);
			},

			$$slots: {
				default: true,
				title: ($$renderer) => {
					{
						$$renderer.push(`Thank you`);
					}
				}
			}
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}