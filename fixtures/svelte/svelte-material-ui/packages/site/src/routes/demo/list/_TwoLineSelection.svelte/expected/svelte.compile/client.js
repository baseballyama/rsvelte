import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import List, { Item, Graphic, Meta, Text, PrimaryText, SecondaryText } from '@smui/list';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="svelte-17y8g90"><!></div> <pre class="status svelte-17y8g90"> </pre> <div style="margin-top: 1em;" class="svelte-17y8g90"><div class="svelte-17y8g90">Programmatically select:</div> <!></div> <div style="margin-top: 1em;" class="svelte-17y8g90"><div class="svelte-17y8g90">Programmatically focus:</div> <!></div>`, 1);

export default function _TwoLineSelection($$anchor, $$props) {
	$.push($$props, true);

	let list;

	let options = [
		{ name: 'Bruce Willis', description: 'Actor', disabled: false },
		{
			name: 'Austin Powers',
			description: 'Fictional Character',
			disabled: true
		},

		{
			name: 'Thomas Edison',
			description: 'Inventor',
			disabled: false
		},

		{
			name: 'Stephen Hawking',
			description: 'Scientist',
			disabled: false
		}
	];

	let selectionIndex = $.state(3);
	var fragment = root_2();
	var div = $.first_child(fragment);
	var node = $.child(div);

	$.bind_this(
		List(node, {
			class: 'demo-list',
			twoLine: true,
			avatarList: true,
			singleSelection: true,
			get selectedIndex() {
				return $.get(selectionIndex);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.each(node_1, 17, () => options, $.index, ($$anchor, item, i) => {
					{
						let $0 = $.derived(() => $.get(selectionIndex) === i);

						Item($$anchor, {
							onSMUIAction: () => $.set(selectionIndex, i, true),
							get disabled() {
								return $.get(item).disabled;
							},

							get selected() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_3 = root_1();
								var node_2 = $.first_child(fragment_3);

								{
									let $0 = $.derived(() => $.get(item).name.split(' ').map((val) => val.substring(0, 1)).join(''));

									Graphic(node_2, {
										get style() {
											return `background-image: url(https://placehold.co/40x40?text=${$.get($0) ?? ''});`;
										}
									});
								}

								var node_3 = $.sibling(node_2, 2);

								Text(node_3, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_4 = $.first_child(fragment_4);

										PrimaryText(node_4, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $.get(item).name));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});

										var node_5 = $.sibling(node_4, 2);

										SecondaryText(node_5, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text();

												$.template_effect(() => $.set_text(text_1, $.get(item).description));
												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});

								var node_6 = $.sibling(node_3, 2);

								Meta(node_6, {
									class: 'material-icons',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('info');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					}
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}),
		($$value) => list = $$value,
		() => list
	);

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_3 = $.only_child(pre);
	var div_1 = $.sibling(pre, 2);
	var node_7 = $.sibling($.child(div_1), 2);

	$.each(node_7, 17, () => options, $.index, ($$anchor, option, i) => {
		Button($$anchor, {
			onclick: () => $.set(selectionIndex, i, true),
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_4 = $.text();

						$.template_effect(() => $.set_text(text_4, $.get(option).name));
						$.append($$anchor, text_4);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_8 = $.sibling($.child(div_2), 2);

	$.each(node_8, 17, () => options, $.index, ($$anchor, option, i) => {
		Button($$anchor, {
			onclick: () => list.focusItemAtIndex(i),
			children: ($$anchor, $$slotProps) => {
				Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_5 = $.text();

						$.template_effect(() => $.set_text(text_5, $.get(option).name));
						$.append($$anchor, text_5);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);
	$.template_effect(() => $.set_text(text_3, `Selected: ${$.get(selectionIndex) ?? ''} - ${options[$.get(selectionIndex)].name ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}