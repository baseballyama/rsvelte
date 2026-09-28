import * as $ from 'svelte/internal/server';
import { page } from '$app/state';
import { onMount } from 'svelte';
import { z } from 'zod';
import { toast } from 'svelte-sonner';
import { AddressSchema } from '$lib/core/components/index.js';

export default function Address_form_renderer($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		/**
		 * Local shadow of @misiki/kitcommerce-core's AddressFormRenderer. Same validation, same
		 * callbacks; three things the vendored one cannot be given from a call site:
		 *
		 *  - it never passes `isSaving` to the snippet, so the spinner never rendered and the submit
		 *    button was never disabled — an impatient double-tap saved the address twice;
		 *  - it calls `onsave?.(address)` without awaiting, so a rejected save (handleSaveAddress →
		 *    addressService.saveAddress has no try/catch) surfaced as an unhandled rejection;
		 *  - it sets `show = false` unconditionally, so the dialog closed as if the save succeeded and
		 *    the shopper returned to checkout with no shipping address and no message.
		 */
		let {
			content,
			onback,
			ondelete,
			onsave,
			show = void 0,
			address = void 0
		} = $$props;

		let isSaving = false;

		function handleBack() {
			onback?.();
			show = false;
		}

		async function handleSubmit(e) {
			e.preventDefault();

			if (isSaving) return;
			if (address) address.countryCode = address.countryCode || page?.data?.store?.country?.code || 'AU';

			const validation = z.object(AddressSchema).safeParse(address);

			if (!validation.success) {
				toast.error(validation.error?.errors?.[0]?.message || 'Fill all fields correctly');

				return;
			}

			isSaving = true;

			try {
				await onsave?.(address);
				show = false;
			} catch(err) {
				toast.error(err?.message || 'Could not save this address. Please try again.');
			} finally {
				isSaving = false;
			}
		}

		function handleDelete() {
			if (confirm('Are you sure you want to delete this address?')) {
				ondelete?.(address);
				show = false;
			}
		}

		onMount(() => {
			if (!address) return;

			address.countryCode = address.countryCode || page?.data?.store?.country?.code || 'AU';
		});

		content?.($$renderer, { isSaving, handleBack, handleSubmit, handleDelete });
		$$renderer.push(`<!---->`);
		$.bind_props($$props, { show, address });
	});
}