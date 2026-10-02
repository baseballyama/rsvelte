import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Collapsible from '$lib/components/ui/collapsible/index.js';
import FolderIcon from '@lucide/svelte/icons/folder';
import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<!> <span> </span>`, 1);
var root_1 = $.from_html(`<div class="relative flex place-items-start"><div class="bg-border mx-2 h-full w-px"></div> <div class="flex flex-1 flex-col"><!></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tree_view_folder($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, true);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
		Collapsible_Root($$anchor, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('flex place-items-center gap-1', $$props.class));

					$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
						Collapsible_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								{
									var consequent = ($$anchor) => {
										var fragment_3 = $.comment();
										var node_3 = $.first_child(fragment_3);

										$.snippet(node_3, () => $$props.icon, () => ({ name: $$props.name, open: open() }));
										$.append($$anchor, fragment_3);
									};

									var consequent_1 = ($$anchor) => {
										FolderOpenIcon($$anchor, { class: 'size-4' });
									};

									var alternate = ($$anchor) => {
										FolderIcon($$anchor, { class: 'size-4' });
									};

									$.if(node_2, ($$render) => {
										if ($$props.icon) $$render(consequent); else if (open()) $$render(consequent_1, 1); else $$render(alternate, -1);
									});
								}

								var span = $.sibling(node_2, 2);
								var text = $.only_child(span, true);

								$.template_effect(() => $.set_text(text, $$props.name));
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
					Collapsible_Content($$anchor, {
						class: 'ml-2 border-l',
						children: ($$anchor, $$slotProps) => {
							var div = root_1();
							var div_1 = $.sibling($.child(div), 2);
							var node_5 = $.child(div_1);

							$.snippet(node_5, () => $$props.children ?? $.noop);
							$.reset(div_1);
							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}