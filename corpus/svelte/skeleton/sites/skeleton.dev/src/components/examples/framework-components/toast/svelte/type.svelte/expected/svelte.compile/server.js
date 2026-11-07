import * as $ from 'svelte/internal/server';
import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';

export default function Type($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const toaster = createToaster();

		$$renderer.push(`<div class="grid grid-cols-2 gap-2"><button class="btn preset-filled">Info</button> <button class="btn preset-filled-success-500">Success</button> <button class="btn preset-filled-warning-500">Warning</button> <button class="btn preset-filled-error-500">Error</button></div> `);

		{
			function children($$renderer, toast) {
				Toast($$renderer, {
					toast,
					children: ($$renderer) => {
						if (Toast.Message) {
							$$renderer.push('<!--[-->');

							Toast.Message($$renderer, {
								children: ($$renderer) => {
									if (Toast.Title) {
										$$renderer.push('<!--[-->');

										Toast.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(toast.title)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Toast.Description) {
										$$renderer.push('<!--[-->');

										Toast.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(toast.description)}`);
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

						if (Toast.CloseTrigger) {
							$$renderer.push('<!--[-->');
							Toast.CloseTrigger($$renderer, {});
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
				Toast.Group($$renderer, { toaster, children, $$slots: { default: true } });
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		}
	});
}