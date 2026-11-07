import * as $ from 'svelte/internal/server';
import Button from '$lib/components/button.svelte';
import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
import { sleep } from '$lib/utils/sleep';
import { toast } from 'svelte-sonner';

export default function Confirm_delete_dialog_skip_confirmation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = false;

		async function submit() {
			loading = true;
			await sleep(500);
			toast.success('Deleted!');
			loading = false;
		}

		ConfirmDeleteDialog($$renderer, {});
		$$renderer.push(`<!----> <div class="flex flex-col items-center justify-center gap-2">`);

		Button($$renderer, {
			loading,
			variant: 'destructive',
			size: 'lg',
			onclick: (e) => {
				confirmDelete({
					title: 'Delete',
					description: 'Are you sure you want to delete this item?',
					skipConfirmation: e.shiftKey,
					onConfirm: submit
				});
			},

			children: ($$renderer) => {
				$$renderer.push(`<!---->Delete`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">Shift + Click to skip confirmation.</span></div>`);
	});
}