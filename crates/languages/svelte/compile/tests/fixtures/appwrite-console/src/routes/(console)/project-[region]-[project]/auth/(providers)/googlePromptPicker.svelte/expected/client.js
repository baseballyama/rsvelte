import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ProjectOAuth2GooglePrompt } from '@appwrite.io/console';
import { Layout, Tag, Typography } from '@appwrite.io/pink-svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function GooglePromptPicker($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 31, () => $.proxy([]));

	const options = [
		{ val: ProjectOAuth2GooglePrompt.None, label: 'None' },
		{ val: ProjectOAuth2GooglePrompt.Consent, label: 'Consent' },
		{
			val: ProjectOAuth2GooglePrompt.SelectAccount,
			label: 'Select account'
		}
	];

	function toggle(opt) {
		let next;

		if (opt === ProjectOAuth2GooglePrompt.None) {
			next = value().includes(opt) ? [] : [opt];
		} else {
			next = value().includes(opt)
				? value().filter((v) => v !== opt)
				: [
					...value().filter((v) => v !== ProjectOAuth2GooglePrompt.None),
					opt
				];
		}

		value(next);
		$$props.onchange?.(next);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Layout.Stack, ($$anchor, Layout_Stack) => {
		Layout_Stack($$anchor, {
			gap: 'xs',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Typography.Text, ($$anchor, Typography_Text) => {
					Typography_Text($$anchor, {
						variant: 'm-500',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Prompt');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Layout.Stack, ($$anchor, Layout_Stack_1) => {
					Layout_Stack_1($$anchor, {
						direction: 'row',
						gap: 's',
						flexWrap: 'wrap',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.each(node_3, 17, () => options, (option) => option.val, ($$anchor, option) => {
								{
									let $0 = $.derived(() => value().includes($.get(option).val));

									Tag($$anchor, {
										size: 's',
										get selected() {
											return $.get($0);
										},
										$$events: { click: () => toggle($.get(option).val) },
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(option).label));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								}
							});

							$.append($$anchor, fragment_2);
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