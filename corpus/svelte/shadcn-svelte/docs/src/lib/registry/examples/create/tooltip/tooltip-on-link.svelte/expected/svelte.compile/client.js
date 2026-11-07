import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<a>Learn more</a>`);
var root_1 = $.from_html(`<p>Click to read the documentation</p>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_on_link($$anchor) {
	Example($$anchor, {
		title: 'On Link',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
				Tooltip_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								var a = root();
								var event_handler = (e) => e.preventDefault();

								$.attribute_effect(a, () => ({
									href: '/',
									class: 'w-fit text-sm text-primary underline-offset-4 hover:underline',
									onclick: event_handler,
									...props()
								}));

								$.append($$anchor, a);
							};

							$.component(node_1, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
								Tooltip_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
							Tooltip_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var p = root_1();

									$.append($$anchor, p);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}