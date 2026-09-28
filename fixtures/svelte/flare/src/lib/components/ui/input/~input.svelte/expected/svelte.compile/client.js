import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

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
				($0) => ({ 'data-slot': 'input', class: $0, type: 'file', ...restProps }),
				[
					() => cn('selection:bg-primary dark:bg-input/30 selection:text-primary-foreground border-input ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 pt-1.5 text-sm font-medium shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', $$props.class)
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
					'data-slot': 'input',
					class: $0,
					type: $$props.type,
					...restProps
				}),
				[
					() => cn('border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm', 'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive', $$props.class)
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
			if ($$props.type === 'file') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}