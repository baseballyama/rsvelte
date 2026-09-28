import * as $ from 'svelte/internal/server';
import { copy } from '$lib/helpers/copy';
import { clickOnEnter } from '$lib/helpers/a11y';
import { Tooltip } from '@appwrite.io/pink-svelte';
import { trackEvent } from '$lib/actions/analytics';
import { addNotification } from '$lib/stores/notifications';

export default function Copy($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			value,
			event = null,
			eventContext = 'click_id_tag',
			tooltipDisabled = false,
			tooltipPortal = false,
			tooltipDelay = 0,
			tooltipPlacement = undefined,
			copyText = 'Click to copy',
			children
		} = $$props;

		let content = copyText;

		async function handleClick() {
			const success = await copy(value);

			if (success) {
				content = 'Copied';
			} else {
				addNotification({ message: 'Unable to copy to clipboard', type: 'error' });
			}

			if (event) {
				trackEvent(eventContext, { name: event });
			}
		}

		Tooltip($$renderer, {
			disabled: //TODO: remove this component
			tooltipDisabled,
			portal: tooltipPortal,
			delay: tooltipDelay,
			maxWidth: '500px',
			placement: tooltipPlacement,
			children: ($$renderer) => {
				$$renderer.push(`<span data-private="" role="button" tabindex="0"${$.attr_style('', { display: 'inline-flex', cursor: 'pointer' })}>`);
				children?.($$renderer);
				$$renderer.push(`<!----></span>`);
			},

			$$slots: {
				default: true,
				tooltip: ($$renderer, { showing }) => {
					$$renderer.push(`<p slot="tooltip">`);

					if (showing) {
						$$renderer.push(`<!--[0-->${$.escape(content)}`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></p>`);
				}
			}
		});
	});
}