import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
import { sleep } from '$lib/utils/sleep';
import { toast } from 'svelte-sonner';

export default function Confirm_delete_dialog_with_text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		ConfirmDeleteDialog($$renderer, {});
		$$renderer.push(`<!----> <div class="flex items-center justify-center">`);

		Button($$renderer, {
			variant: 'destructive',
			size: 'lg',
			onclick: () => {
				confirmDelete({
					title: 'Delete',
					description: 'Are you sure you want to delete this item?',
					input: { confirmationText: 'Please' },
					onConfirm: async () => {
						await sleep(500);
						toast.success('Deleted!');
					}
				});
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Delete`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}