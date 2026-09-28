import * as $ from 'svelte/internal/server';
import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';

export default function Promise_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const toaster = createToaster();

		function generatePositiveNumber() {
			return new Promise((resolve, reject) => {
				setTimeout(
					() => {
						const number = Math.random() - 0.5;

						if (number > 0) {
							resolve(number);
						} else {
							reject(number);
						}
					},
					2000
				);
			});
		}

		$$renderer.push(`<button class="btn preset-filled">Toast</button> `);

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