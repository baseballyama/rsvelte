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
	'class'
]);

var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15),
		files = $.prop($$props, 'files', 15),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var input = root();

			$.attribute_effect(
				input,
				($0) => ({ class: $0, type: 'file', ...restProps }),
				[
					() => cn("flex h-8 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm outline-none not-dark:bg-card selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", $$props.class)
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
				($0) => ({ class: $0, type: $$props.type, ...restProps }),
				[
					() => cn("flex h-8 w-full min-w-0 rounded-md border border-input bg-card px-3 py-1 text-sm outline-none not-dark:bg-card selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/15", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", $$props.class)
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