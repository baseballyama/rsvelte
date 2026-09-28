import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Switch, useId } from "bits-ui";
import DemoContainer from "../demo-container.svelte";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'id',
	'checked',
	'ref',
	'labelText'
]);

var root = $.from_html(`<div class="flex items-center space-x-3"><!> <!></div>`);

export default function Switch_demo_custom($$anchor, $$props) {
	$.push($$props, true);

	let id = $.prop($$props, 'id', 19, useId),
		checked = $.prop($$props, 'checked', 11, false),
		ref = $.prop($$props, 'ref', 11, null),
		restProps = $.rest_props($$props, rest_excludes);

	DemoContainer($$anchor, {
		size: 'xs',
		wrapperClass: 'rounded-bl-card rounded-br-card',
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			$.component(node, () => Switch.Root, ($$anchor, Switch_Root) => {
				Switch_Root($$anchor, $.spread_props(() => restProps, {
					get id() {
						return id();
					},
					class: 'focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-foreground data-[state=unchecked]:bg-dark-10 data-[state=unchecked]:shadow-mini-inset dark:data-[state=checked]:bg-foreground focus-visible:outline-hidden peer inline-flex h-[36px] min-h-[36px] w-[60px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					children: ($$anchor, $$slotProps) => {
						var fragment_1 = $.comment();
						var node_1 = $.first_child(fragment_1);

						$.component(node_1, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, {
								class: 'bg-background data-[state=unchecked]:shadow-mini dark:border-background/30 dark:bg-foreground dark:shadow-popover pointer-events-none block size-[30px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0 dark:border dark:data-[state=unchecked]:border'
							});
						});

						$.append($$anchor, fragment_1);
					},
					$$slots: { default: true }
				}));
			});

			var node_2 = $.sibling(node, 2);

			$.component(node_2, () => Label.Root, ($$anchor, Label_Root) => {
				Label_Root($$anchor, {
					get for() {
						return id();
					},
					class: 'peer-disabled:text-muted-foreground text-sm font-medium',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text();

						$.template_effect(() => $.set_text(text, $$props.labelText));
						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}