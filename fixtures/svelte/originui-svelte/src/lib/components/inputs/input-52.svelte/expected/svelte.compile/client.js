import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { usePasswordStrength } from '$lib/hooks/use-password-strength.svelte';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import Eye from '@lucide/svelte/icons/eye';
import EyeOff from '@lucide/svelte/icons/eye-off';
import X from '@lucide/svelte/icons/x';

var root = $.from_html(`<li class="flex items-center space-x-2"><!> <span> <span class="sr-only"> </span></span></li>`);
var root_1 = $.from_html(`<div><div class="*:not-first:mt-2"><!> <div class="relative"><!> <button class="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50" type="button"><!></button></div></div> <div class="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full" role="progressbar" aria-label="Password strength"><div></div></div> <p id="password-strength" class="text-foreground mb-2 text-sm font-medium"> </p> <ul class="space-y-1.5" aria-label="Password requirements"></ul></div>`);

export default function Input_52($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	const passwordStrength = usePasswordStrength({ id: uid });
	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Input with password strength indicator');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	{
		let $0 = $.derived(() => passwordStrength.isVisible ? 'text' : 'password');

		Input(node_1, {
			get id() {
				return passwordStrength.id;
			},
			class: 'pe-9',
			placeholder: 'Password',
			get type() {
				return $.get($0);
			},

			get 'aria-describedby'() {
				return passwordStrength.id;
			},

			get value() {
				return passwordStrength.password;
			},

			set value($$value) {
				passwordStrength.password = $$value;
			}
		});
	}

	var button = $.sibling(node_1, 2);
	var node_2 = $.child(button);

	{
		var consequent = ($$anchor) => {
			EyeOff($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		var alternate = ($$anchor) => {
			Eye($$anchor, { size: 16, 'aria-hidden': 'true' });
		};

		$.if(node_2, ($$render) => {
			if (passwordStrength.isVisible) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);

	$.set_attribute(div_3, 'aria-valuemin', 0);
	$.set_attribute(div_3, 'aria-valuemax', 4);

	var div_4 = $.child(div_3);
	let styles;

	$.reset(div_3);

	var p = $.sibling(div_3, 2);
	var text_1 = $.only_child(p);
	var ul = $.sibling(p, 2);

	$.each(ul, 21, () => passwordStrength.strength, (req) => req.text, ($$anchor, req) => {
		var li = root();
		var node_3 = $.child(li);

		{
			var consequent_1 = ($$anchor) => {
				Check($$anchor, { size: 16, class: 'text-emerald-500', 'aria-hidden': 'true' });
			};

			var alternate_1 = ($$anchor) => {
				X($$anchor, {
					size: 16,
					class: 'text-muted-foreground/80',
					'aria-hidden': 'true'
				});
			};

			$.if(node_3, ($$render) => {
				if ($.get(req).met) $$render(consequent_1); else $$render(alternate_1, -1);
			});
		}

		var span = $.sibling(node_3, 2);
		var text_2 = $.child(span);
		var span_1 = $.sibling(text_2);
		var text_3 = $.only_child(span_1, true);

		$.reset(span);
		$.reset(li);

		$.template_effect(() => {
			$.set_class(span, 1, `text-xs ${$.get(req).met ? 'text-emerald-600' : 'text-muted-foreground'}`);
			$.set_text(text_2, `${$.get(req).text ?? ''} `);
			$.set_text(text_3, $.get(req).met ? ' - Requirement met' : ' - Requirement not met');
		});

		$.append($$anchor, li);
	});

	$.reset(ul);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_attribute(button, 'aria-label', passwordStrength.isVisible ? 'Hide password' : 'Show password');
			$.set_attribute(button, 'aria-pressed', passwordStrength.isVisible);
			$.set_attribute(button, 'aria-controls', passwordStrength.id);
			$.set_attribute(div_3, 'aria-valuenow', passwordStrength.strengthScore);
			$.set_class(div_4, 1, $0);
			styles = $.set_style(div_4, '', styles, { width: `${passwordStrength.strengthScore / 4 * 100}%` });
			$.set_text(text_1, `${passwordStrength.strengthText ?? ''}. Must contain:`);
		},
		[
			() => $.clsx(cn(`h-full transition-all duration-500 ease-out`, passwordStrength.strengthColor))
		]
	);

	$.delegated('click', button, function (...$$args) {
		passwordStrength.toggleVisibility?.apply(this, $$args);
	});

	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);