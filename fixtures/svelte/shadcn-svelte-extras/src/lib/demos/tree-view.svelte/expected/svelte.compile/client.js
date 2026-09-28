import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as TreeView from '$lib/components/ui/tree-view';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="h-40 w-72"><!></div>`);

export default function Tree_view($$anchor) {
	var div = root_2();
	var node = $.child(div);

	$.component(node, () => TreeView.Root, ($$anchor, TreeView_Root) => {
		TreeView_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => TreeView.Folder, ($$anchor, TreeView_Folder) => {
					TreeView_Folder($$anchor, {
						name: 'src',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root_1();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => TreeView.Folder, ($$anchor, TreeView_Folder_1) => {
								TreeView_Folder_1($$anchor, {
									name: 'routes',
									children: ($$anchor, $$slotProps) => {
										var fragment_2 = root();
										var node_3 = $.first_child(fragment_2);

										$.component(node_3, () => TreeView.File, ($$anchor, TreeView_File) => {
											TreeView_File($$anchor, { name: '+layout.svelte' });
										});

										var node_4 = $.sibling(node_3, 2);

										$.component(node_4, () => TreeView.File, ($$anchor, TreeView_File_1) => {
											TreeView_File_1($$anchor, { name: '+page.svelte' });
										});

										$.append($$anchor, fragment_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_2, 2);

							$.component(node_5, () => TreeView.File, ($$anchor, TreeView_File_2) => {
								TreeView_File_2($$anchor, { name: 'app.css' });
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => TreeView.File, ($$anchor, TreeView_File_3) => {
								TreeView_File_3($$anchor, { name: 'hooks.server.ts' });
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}