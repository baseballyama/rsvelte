import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Popover from '../../primitives/Popover.svelte';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Link from '@lucide/svelte/icons/link-2';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

var root = $.from_html(`<div><!> <!></div>`);
var root_1 = $.from_html(`<button type="submit" class="edra-btn edra-btn-icon-xs check-btn svelte-17hx3sz"><!></button>`);
var root_2 = $.from_html(`<form class="link-form svelte-17hx3sz"><input class="edra-input link-input svelte-17hx3sz" placeholder="Type or paste a link..." required="" type="url"/> <!></form>`);

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

	{
		const trigger = ($$anchor) => {
			Tooltip($$anchor, {
				tooltip: 'Link',
				children: ($$anchor, $$slotProps) => {
					var div = root();
					var node = $.child(div);

					Link(node, {});

					var node_1 = $.sibling(node, 2);

					ChevronDown(node_1, { class: 'chevron-icon' });
					$.reset(div);
					$.template_effect(($0) => $.set_class(div, 1, `edra-btn edra-btn-ghost edra-btn-icon ${$0 ?? ''}`, 'svelte-17hx3sz'), [() => isActive() ? 'active' : '']);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});
		};

		Popover($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			trigger,
			children: ($$anchor, $$slotProps) => {
				var form = root_2();
				var input = $.child(form);

				$.remove_input_defaults(input);

				var node_2 = $.sibling(input, 2);

				Tooltip(node_2, {
					tooltip: 'Insert link',
					children: ($$anchor, $$slotProps) => {
						var button = root_1();
						var node_3 = $.child(button);

						Check(node_3, {});
						$.reset(button);
						$.append($$anchor, button);
					},
					$$slots: { default: true }
				});

				$.reset(form);
				$.event('submit', form, handleSubmit);
				$.bind_value(input, () => $.get(value), ($$value) => $.set(value, $$value));
				$.append($$anchor, form);
			},
			$$slots: { trigger: true, default: true }
		});
	}

	$.pop();
}