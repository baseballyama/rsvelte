import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GlobeIcon from '@lucide/svelte/icons/globe';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
import { buttonVariants } from '$lib/components/ui/button';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<!> <span class="sr-only">Change language</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Language_switcher($$anchor, $$props) {
	$.push($$props, true);

	let languages = $.prop($$props, 'languages', 19, () => []),
		value = $.prop($$props, 'value', 15, ''),
		align = $.prop($$props, 'align', 3, 'end'),
		variant = $.prop($$props, 'variant', 3, 'outline');

	// set default code if there isn't one selected
	if (value() === '') {
		value(languages()[0].code);
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
		DropdownMenu_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn(buttonVariants({ variant: variant(), size: 'icon' }), $$props.class));

					$.component(node_1, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
						DropdownMenu_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},
							'aria-label': 'Change language',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								GlobeIcon(node_2, { class: 'size-4' });
								$.next(2);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
					DropdownMenu_Content($$anchor, {
						get align() {
							return align();
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.component(node_4, () => DropdownMenu.RadioGroup, ($$anchor, DropdownMenu_RadioGroup) => {
								DropdownMenu_RadioGroup($$anchor, {
									get onValueChange() {
										return $$props.onChange;
									},

									get value() {
										return value();
									},

									set value($$value) {
										value($$value);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = $.comment();
										var node_5 = $.first_child(fragment_4);

										$.each(node_5, 17, languages, (language) => language.code, ($$anchor, language) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											$.component(node_6, () => DropdownMenu.RadioItem, ($$anchor, DropdownMenu_RadioItem) => {
												DropdownMenu_RadioItem($$anchor, {
													get value() {
														return $.get(language).code;
													},

													children: ($$anchor, $$slotProps) => {
														$.next();

														var text = $.text();

														$.template_effect(() => $.set_text(text, $.get(language).label));
														$.append($$anchor, text);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_5);
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
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