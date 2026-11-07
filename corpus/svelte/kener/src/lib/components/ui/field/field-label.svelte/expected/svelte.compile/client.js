import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label } from "$lib/components/ui/label/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

export default function Field_label($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn("group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50", "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4", "has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:border-primary dark:has-data-[state=checked]:bg-primary/10", $$props.class));

		Label($$anchor, $.spread_props(
			{
				'data-slot': 'field-label',
				get class() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					$.snippet(node, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}