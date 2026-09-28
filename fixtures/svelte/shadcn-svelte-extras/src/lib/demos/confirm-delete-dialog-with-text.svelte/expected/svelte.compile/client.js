import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
import { sleep } from '$lib/utils/sleep';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <div class="flex items-center justify-center"><!></div>`, 1);

export default function Confirm_delete_dialog_with_text($$anchor, $$props) {
	$.push($$props, true);

	var fragment = root();
	var node = $.first_child(fragment);

	ConfirmDeleteDialog(node, {});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
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

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Delete');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}