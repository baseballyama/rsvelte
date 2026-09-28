import * as $ from 'svelte/internal/server';
import { FloatingActionBar, Icon, Layout } from '@appwrite.io/pink-svelte';
import { IconExclamationCircle, IconExclamation } from '@appwrite.io/pink-icons-svelte';

export default function ErrorSonner($$renderer, $$props) {
	let { message, severity = 'error' } = $$props;
	const properIcon = $.derived(() => severity === 'warning' ? IconExclamation : IconExclamationCircle);
	const iconColor = $.derived(() => severity === 'warning' ? '--fgcolor-warning' : '--fgcolor-error');

	if (message) {
		$$renderer.push(`<!--[0--><div class="floating-action-bar svelte-1y4xpqh">`);

		FloatingActionBar($$renderer, {
			$$slots: {
				start: ($$renderer) => {
					{
						if (Layout.Stack) {
							$$renderer.push('<!--[-->');

							Layout.Stack($$renderer, {
								inline: true,
								gap: 's',
								direction: 'row',
								alignItems: 'center',
								style: 'width: max-content;',
								children: ($$renderer) => {
									Icon($$renderer, { icon: properIcon(), color: iconColor() });
									$$renderer.push(`<!----> <div class="sonner-message svelte-1y4xpqh">${$.escape(message)}</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}
				}
			}
		});

		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}