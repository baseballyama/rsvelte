import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Input from '$lib/components/ui/input.svelte';
import Label from '$lib/components/ui/label.svelte';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '$lib/components/ui/tooltip/index.js';
import { cn } from '$lib/utils.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';

var root = $.from_html(`<button><div><!></div> <div><!></div></button>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="*:not-first:mt-2"><!> <div class="relative"><!> <!></div></div>`);

export default function Input_54($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let copied = $.state(false);
	let inputElement = $.state(null);

	async function handleCopy() {
		if (!$.get(inputElement)) return;

		await navigator.clipboard.writeText($.get(inputElement).value);
		$.set(copied, true);

		setTimeout(
			() => {
				$.set(copied, false);
			},
			1500
		);
	}

	var div = root_2();
	var node = $.child(div);

	Label(node, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Copy to clipboard');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);

	Input(node_1, {
		get id() {
			return uid;
		},
		class: 'pe-9',
		type: 'text',
		value: 'npx sv create my-app',
		readonly: true,
		get ref() {
			return $.get(inputElement);
		},

		set ref($$value) {
			$.set(inputElement, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	TooltipProvider(node_2, {
		children: ($$anchor, $$slotProps) => {
			Tooltip($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_1();
					var node_3 = $.first_child(fragment_1);

					{
						const child = ($$anchor, $$arg0) => {
							let props = () => ($$arg0?.()).props;
							var button = root();

							$.attribute_effect(button, () => ({ ...props() }));

							var div_2 = $.child(button);
							var node_4 = $.child(div_2);

							Check(node_4, { class: 'stroke-emerald-500', size: 16, 'aria-hidden': 'true' });
							$.reset(div_2);

							var div_3 = $.sibling(div_2, 2);
							var node_5 = $.child(div_3);

							Copy(node_5, { size: 16, 'aria-hidden': 'true' });
							$.reset(div_3);
							$.reset(button);

							$.template_effect(
								($0, $1) => {
									$.set_class(div_2, 1, $0);
									$.set_class(div_3, 1, $1);
								},
								[
									() => $.clsx(cn('transition-all', $.get(copied) ? 'scale-100 opacity-100' : 'scale-0 opacity-0')),
									() => $.clsx(cn('absolute transition-all', $.get(copied) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'))
								]
							);

							$.append($$anchor, button);
						};

						let $0 = $.derived(() => $.get(copied) ? 'Copied' : 'Copy to clipboard');

						TooltipTrigger(node_3, {
							onclick: handleCopy,
							class: 'text-muted-foreground/80 ring-offset-background hover:text-foreground focus-visible:border-ring focus-visible:text-foreground focus-visible:ring-ring/30 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg border border-transparent transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:cursor-not-allowed',
							get 'aria-label'() {
								return $.get($0);
							},

							get disabled() {
								return $.get(copied);
							},
							child,
							$$slots: { child: true }
						});
					}

					var node_6 = $.sibling(node_3, 2);

					TooltipContent(node_6, {
						class: 'border-input bg-popover text-muted-foreground border px-2 py-1 text-xs',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Copy to clipboard');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}