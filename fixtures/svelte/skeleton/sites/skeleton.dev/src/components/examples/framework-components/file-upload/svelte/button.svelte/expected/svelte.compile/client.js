import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUpload } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Button($$anchor) {
	FileUpload($$anchor, {
		class: 'w-fit',
		onFileAccept: console.log,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => FileUpload.Trigger, ($$anchor, FileUpload_Trigger) => {
				FileUpload_Trigger($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Browse Files');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => FileUpload.HiddenInput, ($$anchor, FileUpload_HiddenInput) => {
				FileUpload_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}