import * as $ from 'svelte/internal/server';
import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let overlap = false;
		let duration = Infinity;
		let toaster = $.derived(() => createToaster({ overlap }));

		const createToast = () => {
			toaster().info({
				title: 'Toast',
				description: 'This is a toast message.',
				duration,
				action: {
					label: 'Undo',
					onClick: () => toaster().success({ title: 'Undone' })
				}
			});
		};

		$$renderer.push(`<button class="btn preset-filled">Toast</button> <label class="label"><span class="label-text">Options</span> <div class="rounded-container border border-surface-200-800 p-2 flex flex-col gap-2"><label class="flex items-center space-x-2"><input class="checkbox" type="checkbox"${$.attr('checked', overlap, true)}/> <span>Overlap</span></label> <label class="label"><span class="label-text">Duration (ms)</span> <input class="input w-32" type="number"${$.attr('value', duration)}/></label></div></label> <!---->`);

		{
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

							if (toast.action) {
								$$renderer.push('<!--[0-->');

								if (Toast.ActionTrigger) {
									$$renderer.push('<!--[-->');

									Toast.ActionTrigger($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(toast.action.label)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

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
					Toast.Group($$renderer, { toaster: toaster(), children, $$slots: { default: true } });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}
		}

		$$renderer.push(`<!---->`);
	});
}