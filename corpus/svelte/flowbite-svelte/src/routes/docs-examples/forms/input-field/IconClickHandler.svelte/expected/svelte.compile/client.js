import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input, ButtonGroup, InputAddon } from "flowbite-svelte";
import { EyeOutline, EyeSlashOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<button class="pointer-events-auto"><!></button>`);
var root_1 = $.from_html(`<button><!></button>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <!></div> <div><!> <!></div>`, 1);

export default function IconClickHandler($$anchor) {
	let show = $.state(false);
	let show1 = $.state(false);
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Label(node, {
		for: 'show-password',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Your password');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		const left = ($$anchor) => {
			var button = root();
			var node_2 = $.child(button);

			{
				var consequent = ($$anchor) => {
					EyeOutline($$anchor, { class: 'h-6 w-6' });
				};

				var alternate = ($$anchor) => {
					EyeSlashOutline($$anchor, { class: 'h-6 w-6' });
				};

				$.if(node_2, ($$render) => {
					if ($.get(show)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(button);
			$.delegated('click', button, () => $.set(show, !$.get(show)));
			$.append($$anchor, button);
		};

		let $0 = $.derived(() => $.get(show) ? "text" : "password");

		Input(node_1, {
			id: 'show-password',
			get type() {
				return $.get($0);
			},
			placeholder: 'Your password here',
			size: 'lg',
			class: 'pl-10',
			left,
			$$slots: { left: true }
		});
	}

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.child(div_1);

	Label(node_3, {
		for: 'show-password1',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Your password');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	ButtonGroup(node_4, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			InputAddon(node_5, {
				children: ($$anchor, $$slotProps) => {
					var button_1 = root_1();
					var node_6 = $.child(button_1);

					{
						var consequent_1 = ($$anchor) => {
							EyeOutline($$anchor, { class: 'h-6 w-6' });
						};

						var alternate_1 = ($$anchor) => {
							EyeSlashOutline($$anchor, { class: 'h-6 w-6' });
						};

						$.if(node_6, ($$render) => {
							if ($.get(show1)) $$render(consequent_1); else $$render(alternate_1, -1);
						});
					}

					$.reset(button_1);
					$.delegated('click', button_1, () => $.set(show1, !$.get(show1)));
					$.append($$anchor, button_1);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => $.get(show1) ? "text" : "password");

				Input(node_7, {
					id: 'show-password1',
					get type() {
						return $.get($0);
					},
					placeholder: 'Your password here'
				});
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}

$.delegate(['click']);