import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import { Eye, EyeOff } from '@lucide/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'value']);
var root = $.from_html(`<div class="relative"><!> <!></div>`);

export default function PasswordInput($$anchor, $$props) {
	$.push($$props, true);

	let value = $.prop($$props, 'value', 15),
		restProps = $.rest_props($$props, rest_excludes);

	let showPassword = $.state(false);
	const inputType = $.derived(() => $.get(showPassword) ? 'text' : 'password');
	var div = root();
	var node = $.child(div);

	Input(node, $.spread_props(() => restProps, {
		get type() {
			return $.get(inputType);
		},
		files: undefined,
		class: 'pr-10',
		get value() {
			return value();
		},

		set value($$value) {
			value($$value);
		}
	}));

	var node_1 = $.sibling(node, 2);

	{
		let $0 = $.derived(() => $.get(showPassword) ? 'Hide password' : 'Show password');

		Button(node_1, {
			type: 'button',
			variant: 'ghost',
			size: 'sm',
			class: 'absolute top-1/2 right-0 h-full w-10 -translate-y-1/2 rounded-lg',
			onclick: () => $.set(showPassword, !$.get(showPassword)),
			get 'aria-label'() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_2 = $.first_child(fragment);

				{
					var consequent = ($$anchor) => {
						EyeOff($$anchor, { class: 'size-4' });
					};

					var alternate = ($$anchor) => {
						Eye($$anchor, { class: 'size-4' });
					};

					$.if(node_2, ($$render) => {
						if ($.get(showPassword)) $$render(consequent); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}