import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from "phosphor-svelte/lib/Check";
import CopySimple from "phosphor-svelte/lib/CopySimple";
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'copyCode',
	'copied'
]);

var root = $.from_html(`<button><!></button>`);

export default function Copy_code_button($$anchor, $$props) {
	$.push($$props, true);

	let copied = $.prop($$props, 'copied', 3, false),
		rest = $.rest_props($$props, rest_excludes);

	var button = root();

	$.attribute_effect(
		button,
		($0) => ({
			class: $0,
			onclick: $$props.copyCode,
			'aria-label': 'Copy',
			...rest,
			'data-copy-code': true
		}),
		[
			() => cn("text-muted-foreground hover:bg-muted focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:outline-hidden relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2", $$props.class)
		]
	);

	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			Check($$anchor, { class: 'h-5 w-5' });
		};

		var alternate = ($$anchor) => {
			CopySimple($$anchor, { class: 'h-5 w-5' });
		};

		$.if(node, ($$render) => {
			if (copied()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.append($$anchor, button);
	$.pop();
}