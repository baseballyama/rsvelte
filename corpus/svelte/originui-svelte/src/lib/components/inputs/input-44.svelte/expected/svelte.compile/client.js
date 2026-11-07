import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Label from '$lib/components/ui/label.svelte';
import { cn } from '$lib/utils.js';
import { PinInput } from 'bits-ui';

const Cell = ($$anchor, cell = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn('border-input bg-background text-foreground ring-offset-background relative flex size-9 items-center justify-center border-y border-e font-medium shadow-xs shadow-black/[.04] transition-all first:rounded-s-lg first:border-s last:rounded-e-lg', {
			'border-ring ring-ring/30 z-10 border ring-2 ring-offset-2': cell().isActive
		}));

		$.component(node, () => PinInput.Cell, ($$anchor, PinInput_Cell) => {
			PinInput_Cell($$anchor, {
				get cell() {
					return cell();
				},

				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					{
						var consequent = ($$anchor) => {
							var div = root();
							var text = $.only_child(div, true);

							$.template_effect(() => $.set_text(text, cell().char));
							$.append($$anchor, div);
						};

						$.if(node_1, ($$render) => {
							if (cell().char !== null) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
};

var root = $.from_html(`<div> </div>`);
var root_1 = $.from_html(`<div class="flex"></div>`);
var root_2 = $.from_html(`<div class="*:not-first:mt-2"><!> <!> <p class="text-muted-foreground mt-2 text-xs" role="region" aria-live="polite">Built with <a class="hover:text-foreground underline" href="https://next.bits-ui.com/docs/components/pin-input" target="_blank" rel="noopener nofollow">Bits UI PIN Input</a></p></div>`);

export default function Input_44($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let value = $.state('');
	var div_1 = root_2();
	var node_2 = $.child(div_1);

	Label(node_2, {
		get for() {
			return uid;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('OTP input single');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let cells = () => ($$arg0?.()).cells;
			var div_2 = root_1();

			$.each(div_2, 21, cells, $.index, ($$anchor, cell) => {
				Cell($$anchor, () => $.get(cell));
			});

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.component(node_3, () => PinInput.Root, ($$anchor, PinInput_Root) => {
			PinInput_Root($$anchor, {
				get id() {
					return uid;
				},
				class: 'flex items-center gap-3 has-disabled:opacity-50',
				maxlength: 4,
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	$.next(2);
	$.reset(div_1);
	$.append($$anchor, div_1);
	$.pop();
}