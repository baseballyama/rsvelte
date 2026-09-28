import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Command from './command.svelte';
import * as Dialog from '$lib/components/ui/dialog';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'open',
	'portalProps',
	'ref',
	'value'
]);

export default function Command_dialog($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, $.spread_props(() => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'overflow-hidden p-0 sm:max-w-lg [&>button:last-child]:hidden',
						get portalProps() {
							return $$props.portalProps;
						},

						children: ($$anchor, $$slotProps) => {
							Command($$anchor, $.spread_props(
								{
									class: '**:data-command-group-heading:text-muted-foreground **:data-command-group:px-2 **:data-command-group-heading:px-2 **:data-command-group-heading:font-medium **:data-command-input:h-12  **:data-command-item:px-3 **:data-command-item:py-2 '
								},
								() => restProps,
								{
									get children() {
										return $$props.children;
									},

									get value() {
										return value();
									},

									set value($$value) {
										value($$value);
									},

									get ref() {
										return ref();
									},

									set ref($$value) {
										ref($$value);
									}
								}
							));
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	$.append($$anchor, fragment);
	$.pop();
}