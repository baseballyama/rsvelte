import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { onMount } from 'svelte';
import { z } from 'zod';
import { toast } from 'svelte-sonner';
import { AddressSchema } from '$lib/core/components/index.js';

export default function Address_form_renderer($$anchor, $$props) {
	$.push($$props, true);

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
	let show = $.prop($$props, 'show', 15),
		address = $.prop($$props, 'address', 15);

	let isSaving = $.state(false);

	function handleBack() {
		$$props.onback?.();
		show(false);
	}

	async function handleSubmit(e) {
		e.preventDefault();

		if ($.get(isSaving)) return;
		if (address()) address(address().countryCode = address().countryCode || page?.data?.store?.country?.code || 'AU', true);

		const validation = z.object(AddressSchema).safeParse(address());

		if (!validation.success) {
			toast.error(validation.error?.errors?.[0]?.message || 'Fill all fields correctly');

			return;
		}

		$.set(isSaving, true);

		try {
			await $$props.onsave?.(address());
			show(false);
		} catch(err) {
			toast.error(err?.message || 'Could not save this address. Please try again.');
		} finally {
			$.set(isSaving, false);
		}
	}

	function handleDelete() {
		if (confirm('Are you sure you want to delete this address?')) {
			$$props.ondelete?.(address());
			show(false);
		}
	}

	onMount(() => {
		if (!address()) return;

		address(address().countryCode = address().countryCode || page?.data?.store?.country?.code || 'AU', true);
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.content ?? $.noop, () => ({
		isSaving: $.get(isSaving),
		handleBack,
		handleSubmit,
		handleDelete
	}));

	$.append($$anchor, fragment);
	$.pop();
}