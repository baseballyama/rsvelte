import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants, Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Link from '@lucide/svelte/icons/link-2';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

var root = $.from_html(`<div><!> <!></div>`);
var root_1 = $.from_html(`<form class="flex items-center gap-0.5"><!> <!></form>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Link_1($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let value = $.state(void 0);
	const editor = getEditor();
	const transaction = useEditorTransaction(editor);

	function isActive() {
		void transaction.version;

		return editor.isActive('link');
	}

	function handleSubmit(e) {
		e.preventDefault();

		if ($.get(value) === undefined || $.get(value).trim() === '') return;

		editor.chain().focus().setLink({ href: $.get(value) }).run();
		$.set(value, undefined);
		$.set(open, false);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
					Popover_Trigger($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Tooltip($$anchor, {
								tooltip: 'Link',
								children: ($$anchor, $$slotProps) => {
									var div = root();
									let classes;
									var node_2 = $.child(div);

									Link(node_2, {});

									var node_3 = $.sibling(node_2, 2);

									ChevronDown(node_3, { class: 'size-2! text-muted-foreground' });
									$.reset(div);

									$.template_effect(($0, $1) => classes = $.set_class(div, 1, $0, null, classes, { 'bg-muted': $1 }), [
										() => $.clsx(buttonVariants({ variant: 'ghost', size: 'icon' })),
										() => isActive()
									]);

									$.append($$anchor, div);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						portalProps: { to: document.getElementById('nota-editor') ?? undefined },
						class: 'h-fit w-80 rounded-lg p-0!',
						children: ($$anchor, $$slotProps) => {
							var form = root_1();
							var node_5 = $.child(form);

							Input(node_5, {
								placeholder: 'Type or paste a link...',
								required: true,
								type: 'url',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								}
							});

							var node_6 = $.sibling(node_5, 2);

							Tooltip(node_6, {
								tooltip: 'Insert link',
								children: ($$anchor, $$slotProps) => {
									Button($$anchor, {
										type: 'submit',
										size: 'icon',
										children: ($$anchor, $$slotProps) => {
											Check($$anchor, {});
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$.reset(form);
							$.event('submit', form, handleSubmit);
							$.append($$anchor, form);
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