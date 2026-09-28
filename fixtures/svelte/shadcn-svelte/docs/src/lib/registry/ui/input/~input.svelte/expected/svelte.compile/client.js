import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'type',
	'files',
	'class',
	'data-slot'
]);

var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		files = $.prop($$props, 'files', 15),
		dataSlot = $.prop($$props, 'data-slot', 3, "input"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.attribute_effect(
				input,
				($0) => ({
					'data-slot': dataSlot(),
					class: $0,
					type: 'file',
					...restProps
				}),
				[
					() => cn("cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", $$props.class)
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.bind_this(input, ($$value) => ref($$value), () => ref());
			$.bind_files(input, files);
			$.bind_value(input, value);
			$.append($$anchor, input);
		};

		var alternate = ($$anchor) => {
			var input_1 = root();

			$.attribute_effect(
				input_1,
				($0) => ({
					'data-slot': dataSlot(),
					class: $0,
					type: $$props.type,
					...restProps
				}),
				[
					() => cn("cn-input w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50", $$props.class)
				],
				void 0,
				void 0,
				void 0,
				true
			);

			$.bind_this(input_1, ($$value) => ref($$value), () => ref());
			$.bind_value(input_1, value);
			$.append($$anchor, input_1);
		};

		$.if(node, ($$render) => {
			if ($$props.type === "file") $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}