import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { ConfirmDeleteDialog, confirmDelete } from '$lib/components/ui/confirm-delete-dialog';
import { sleep } from '$lib/utils/sleep';
import { toast } from 'svelte-sonner';

var root = $.from_html(`<!> <div class="flex flex-col items-center justify-center gap-2"><!> <span class="text-muted-foreground text-sm">Shift + Click to skip confirmation.</span></div>`, 1);

export default function Confirm_delete_dialog_skip_confirmation($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(false);

	async function submit() {
		$.set(loading, true);
		await sleep(500);
		toast.success('Deleted!');
		$.set(loading, false);
	}

	var fragment = root();
	var node = $.first_child(fragment);

	ConfirmDeleteDialog(node, {});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		get loading() {
			return $.get(loading);
		},
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

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Delete');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}