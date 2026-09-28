import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PinInput, REGEXP_ONLY_DIGITS } from "bits-ui";
import { toast } from "svelte-sonner";
import { cn } from "$lib/utils/styles.js";

const Cell = ($$anchor, cell = $.noop) => {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("focus-override", "relative h-14 w-10 text-[2rem]", "flex items-center justify-center", "transition-all duration-75", "border-foreground/20 border-y border-r first:rounded-l-md first:border-l last:rounded-r-md", "text-foreground group-focus-within/pininput:border-foreground/40 group-hover/pininput:border-foreground/40", "outline-0", "data-active:outline-1 data-active:outline-white"));

		$.component(node, () => PinInput.Cell, ($$anchor, PinInput_Cell) => {
			PinInput_Cell($$anchor, {
				get cell() {
					return cell();
				},

				get class() {
					return $.get($0);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();
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

					var node_2 = $.sibling(node_1, 2);

					{
						var consequent_1 = ($$anchor) => {
							var div_1 = root_1();

							$.append($$anchor, div_1);
						};

						$.if(node_2, ($$render) => {
							if (cell().hasFakeCaret) $$render(consequent_1);
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
var root_1 = $.from_html(`<div class="animate-caret-blink pointer-events-none absolute inset-0 flex items-center justify-center"><div class="h-8 w-px bg-white"></div></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div class="flex"></div> <div class="flex w-10 items-center justify-center"><div class="bg-border h-1 w-3 rounded-full"></div></div> <div class="flex"></div>`, 1);

export default function Pin_input_demo($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state("");

	function onComplete() {
		toast.success(`Completed with value ${$.get(value)}`);
		$.set(value, "");
	}

	var fragment_2 = $.comment();
	var node_3 = $.first_child(fragment_2);

	{
		const children = ($$anchor, $$arg0) => {
			let cells = () => ($$arg0?.()).cells;
			var fragment_3 = root_3();
			var div_2 = $.first_child(fragment_3);

			$.each(div_2, 21, () => cells().slice(0, 3), $.index, ($$anchor, cell) => {
				Cell($$anchor, () => $.get(cell));
			});

			$.reset(div_2);

			var div_3 = $.sibling(div_2, 4);

			$.each(div_3, 21, () => cells().slice(3, 6), $.index, ($$anchor, cell) => {
				Cell($$anchor, () => $.get(cell));
			});

			$.reset(div_3);
			$.append($$anchor, fragment_3);
		};

		$.component(node_3, () => PinInput.Root, ($$anchor, PinInput_Root) => {
			PinInput_Root($$anchor, {
				class: 'group/pininput text-foreground has-disabled:opacity-30 flex items-center',
				maxlength: 6,
				onComplete,
				get pattern() {
					return REGEXP_ONLY_DIGITS;
				},

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

	$.append($$anchor, fragment_2);
	$.pop();
}