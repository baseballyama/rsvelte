import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { toast } from "svelte-sonner";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<form><!> <!></form>`);

export default function Data_table_target($$anchor, $$props) {
	$.push($$props, true);

	var form = root();
	var node = $.child(form);

	Label(node, {
		get for() {
			return `${$$props.row.original.id ?? ''}-target`;
		},
		class: 'sr-only',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Target');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Input(node_1, {
		class: 'h-8 w-16 border-transparent bg-transparent text-end shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background dark:bg-transparent dark:hover:bg-input/30 dark:focus-visible:bg-input/30',
		get value() {
			return $$props.row.original.target;
		},

		get id() {
			return `${$$props.row.original.id ?? ''}-target`;
		}
	});

	$.reset(form);

	$.event('submit', form, (e) => {
		e.preventDefault();

		toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
			loading: `Saving ${$$props.row.original.header}`,
			success: "Done",
			error: "Error"
		});
	});

	$.append($$anchor, form);
	$.pop();
}