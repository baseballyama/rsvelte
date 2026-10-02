import * as $ from 'svelte/internal/server';
import { Toast, createToaster } from '../../src/index.js';

export default function Toast_1($$renderer, $$props) {
	const { toaster } = $$props;

	{
		function children($$renderer, toast) {
			Toast($$renderer, {
				toast,
				'data-testid': 'root',
				children: ($$renderer) => {
					if (Toast.Title) {
						$$renderer.push('<!--[-->');
						Toast.Title($$renderer, { 'data-testid': 'title' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Toast.Description) {
						$$renderer.push('<!--[-->');
						Toast.Description($$renderer, { 'data-testid': 'description' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Toast.ActionTrigger) {
						$$renderer.push('<!--[-->');
						Toast.ActionTrigger($$renderer, { 'data-testid': 'action-trigger' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Toast.CloseTrigger) {
						$$renderer.push('<!--[-->');
						Toast.CloseTrigger($$renderer, { 'data-testid': 'close-trigger' });
						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		}

		if (Toast.Group) {
			$$renderer.push('<!--[-->');

			Toast.Group($$renderer, {
				toaster,
				'data-testid': 'group',
				children,
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}