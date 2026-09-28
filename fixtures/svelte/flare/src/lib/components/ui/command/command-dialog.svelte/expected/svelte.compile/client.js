import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Command from './command.svelte';
import * as Dialog from '$lib/components/ui/dialog/index.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'ref',
	'value',
	'title',
	'description',
	'portalProps',
	'children'
]);

var root = $.from_html(`<!> <!>`, 1);

export default function Command_dialog($$anchor, $$props) {
	$.push($$props, true);

	let open = $.prop($$props, 'open', 15, false),
		ref = $.prop($$props, 'ref', 15, null),
		value = $.prop($$props, 'value', 15, ''),
		title = $.prop($$props, 'title', 3, 'Command Palette'),
		description = $.prop($$props, 'description', 3, 'Search for a command to run'),
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
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Header, ($$anchor, Dialog_Header) => {
					Dialog_Header($$anchor, {
						class: 'sr-only',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Dialog.Title, ($$anchor, Dialog_Title) => {
								Dialog_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, title()));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Dialog.Description, ($$anchor, Dialog_Description) => {
								Dialog_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, description()));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'overflow-hidden p-0',
						get portalProps() {
							return $$props.portalProps;
						},

						children: ($$anchor, $$slotProps) => {
							Command($$anchor, $.spread_props(
								{
									class: '**:data-[slot=command-input-wrapper]:h-12 [&_[data-command-group]]:px-2 [&_[data-command-group]:not([hidden])_~[data-command-group]]:pt-0 [&_[data-command-input-wrapper]_svg]:h-5 [&_[data-command-input-wrapper]_svg]:w-5 [&_[data-command-input]]:h-12 [&_[data-command-item]]:px-2 [&_[data-command-item]]:py-3 [&_[data-command-item]_svg]:h-5 [&_[data-command-item]_svg]:w-5'
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