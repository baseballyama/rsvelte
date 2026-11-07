import * as $ from 'svelte/internal/server';
import { applyAction, enhance } from '$app/forms';
import { invalidateAll } from '$app/navigation';
import { loading } from '$state/loading';
import toast from 'svelte-french-toast';

export default function FormWithLoader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let formLoading = false;

		let {
			global = true,
			confirm = '',
			children,
			$$slots,
			$$events,
			...rest
		} = $$props;

		const form_action = (opts, callback) => {
			return function form_enhance({ cancel }) {
				if (global) {
					loading.setLoading(true);
				}

				if (confirm) {
					if (!window.confirm(confirm)) {
						return cancel();
					}
				}

				formLoading = true;

				return async ({ result }) => {
					if (result.type === 'success') {
						toast.success('Siiiiick ' + result.data.message + ' was a success');
					} else if (result.type === 'error') {
						console.log(result);
						toast.error(`Major bummer: ${result.error.message}`);
					} else {
						toast.error(`Something went wrong. Check the console`);
						console.log(result);
					}

					await invalidateAll();
					await applyAction(result);
					formLoading = false;

					if (global) {
						loading.setLoading(false);
					}

					if (callback && 'data' in result && result?.data) callback(result.data);
				};
			};
		};

		$$renderer.push(`<form${$.attributes({ ...rest })}>`);
		children?.($$renderer, { loading: formLoading });
		$$renderer.push(`<!----></form>`);
		$.bind_props($$props, { form_action });
	});
}