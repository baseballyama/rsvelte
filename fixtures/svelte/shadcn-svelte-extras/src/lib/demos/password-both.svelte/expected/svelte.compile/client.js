import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Password from '$lib/components/ui/password';
import * as Toggle from '$lib/components/ui/toggle';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex w-full max-w-3xs flex-col gap-2"><!> <div class="flex w-full place-items-center justify-center gap-2"><!> <!></div></div>`);

export default function Password_both($$anchor) {
	let showVisibility = $.state(true);
	let showCopy = $.state(true);
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Password.Root, ($$anchor, Password_Root) => {
		Password_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Password.Input, ($$anchor, Password_Input) => {
					Password_Input($$anchor, {
						value: 'thisIsASuperLongSecretPasswordThatShouldBeUsedForTestingPurposesAndIsDefinitelyLongerThanMostTypicalPasswords1234567890',
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							{
								var consequent = ($$anchor) => {
									var fragment_2 = $.comment();
									var node_3 = $.first_child(fragment_2);

									$.component(node_3, () => Password.ToggleVisibility, ($$anchor, Password_ToggleVisibility) => {
										Password_ToggleVisibility($$anchor, {});
									});

									$.append($$anchor, fragment_2);
								};

								$.if(node_2, ($$render) => {
									if ($.get(showVisibility)) $$render(consequent);
								});
							}

							var node_4 = $.sibling(node_2, 2);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_3 = $.comment();
									var node_5 = $.first_child(fragment_3);

									$.component(node_5, () => Password.Copy, ($$anchor, Password_Copy) => {
										Password_Copy($$anchor, {});
									});

									$.append($$anchor, fragment_3);
								};

								$.if(node_4, ($$render) => {
									if ($.get(showCopy)) $$render(consequent_1);
								});
							}

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

	var div_1 = $.sibling(node, 2);
	var node_6 = $.child(div_1);

	$.component(node_6, () => Toggle.Root, ($$anchor, Toggle_Root) => {
		Toggle_Root($$anchor, {
			get pressed() {
				return $.get(showVisibility);
			},

			set pressed($$value) {
				$.set(showVisibility, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Show Visibility');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	});

	var node_7 = $.sibling(node_6, 2);

	$.component(node_7, () => Toggle.Root, ($$anchor, Toggle_Root_1) => {
		Toggle_Root_1($$anchor, {
			get pressed() {
				return $.get(showCopy);
			},

			set pressed($$value) {
				$.set(showCopy, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Show Copy');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}