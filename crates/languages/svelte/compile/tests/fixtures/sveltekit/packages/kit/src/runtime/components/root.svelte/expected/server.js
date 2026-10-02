import * as $ from 'svelte/internal/server';
import { afterNavigate } from '$app/navigation';

export default function Root($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { page, components, onerror, tree, form, error } = $$props;
		let mounted = false;
		let navigated = false;
		let title = '';

		afterNavigate(() => {
			if (mounted) {
				navigated = true;
				title = document.title || 'untitled page';
			} else {
				mounted = true;
			}
		});

		function node($$renderer, n, depth) {
			const Component = $.derived(() => n.component);
			const Error = $.derived(() => n.error);
			const data = $.derived(() => n.data);

			function failed($$renderer, error) {
				if (Error()) {
					$$renderer.push('<!--[-->');
					Error()($$renderer, { error });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.boundary({ failed: Error() ? failed : undefined }, ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				{
					if (n.child) {
						$$renderer.push('<!--[0-->');

						if (Component()) {
							$$renderer.push('<!--[-->');

							Component()($$renderer, {
								data: data(),
								form,
								params: page.params,
								children: ($$renderer) => {
									node($$renderer, n.child, depth + 1);
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

						if (Component()) {
							$$renderer.push('<!--[-->');
							Component()($$renderer, { data: data(), form, params: page.params, error });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]-->`);
			});
		}

		node($$renderer, tree, 0);
		$$renderer.push(`<!----> `);

		if (mounted) {
			$$renderer.push(`<!--[0--><div id="svelte-announcer" aria-live="assertive" aria-atomic="true" style="position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px">`);

			if (navigated) {
				$$renderer.push(`<!--[0-->${$.escape(title)}`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}