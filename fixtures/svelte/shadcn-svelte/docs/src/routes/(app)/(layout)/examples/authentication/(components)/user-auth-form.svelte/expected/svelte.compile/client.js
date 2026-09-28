import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GithubIcon from "$lib/components/github.svelte";
import SpinnerIcon from "$lib/components/spinner.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<!> Sign In with Email`, 1);
var root_1 = $.from_html(`<!> GitHub`, 1);
var root_2 = $.from_html(`<div><form><div class="grid gap-2"><div class="grid gap-1"><!> <!></div> <!></div></form> <div class="relative"><div class="absolute inset-0 flex items-center"><span class="w-full border-t"></span></div> <div class="relative flex justify-center text-xs uppercase"><span class="bg-background px-2 text-muted-foreground">Or continue with</span></div></div> <!></div>`);

export default function User_auth_form($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	let isLoading = $.state(false);

	async function onSubmit(e) {
		e.preventDefault();
		$.set(isLoading, true);

		setTimeout(
			() => {
				$.set(isLoading, false);
			},
			3000
		);
	}

	var div = root_2();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("grid gap-6", $$props.class)]);

	var form = $.child(div);
	var div_1 = $.child(form);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		class: 'sr-only',
		for: 'email',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Email');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		id: 'email',
		placeholder: 'name@example.com',
		type: 'email',
		autocapitalize: 'none',
		autocomplete: 'email',
		autocorrect: 'off',
		get disabled() {
			return $.get(isLoading);
		}
	});

	$.reset(div_2);

	var node_2 = $.sibling(div_2, 2);

	Button(node_2, {
		get disabled() {
			return $.get(isLoading);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					SpinnerIcon($$anchor, { class: 'me-2 size-4 animate-spin' });
				};

				$.if(node_3, ($$render) => {
					if ($.get(isLoading)) $$render(consequent);
				});
			}

			$.next();
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(form);

	var node_4 = $.sibling(form, 4);

	Button(node_4, {
		variant: 'outline',
		type: 'button',
		get disabled() {
			return $.get(isLoading);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_5 = $.first_child(fragment_2);

			{
				var consequent_1 = ($$anchor) => {
					SpinnerIcon($$anchor, { class: 'me-2 size-4 animate-spin' });
				};

				var alternate = ($$anchor) => {
					GithubIcon($$anchor, { class: 'me-2 size-4' });
				};

				$.if(node_5, ($$render) => {
					if ($.get(isLoading)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.event('submit', form, onSubmit);
	$.append($$anchor, div);
	$.pop();
}