import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible } from "bits-ui";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'open', 'withOpenCheck']);
var root = $.from_html(`<div>Content</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main><p data-testid="binding"> </p> <!> <button data-testid="alt-trigger">Toggle</button></main>`);

export default function Collapsible_force_mount_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		withOpenCheck = $.prop($$props, 'withOpenCheck', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var main = root_2();
	var p = $.child(main);
	var text = $.only_child(p, true);
	var node = $.sibling(p, 2);

	$.component(node, () => Collapsible.Root, ($$anchor, Collapsible_Root) => {
		Collapsible_Root($$anchor, $.spread_props({ 'data-testid': 'root' }, () => restProps, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Collapsible.Trigger, ($$anchor, Collapsible_Trigger) => {
					Collapsible_Trigger($$anchor, {
						'data-testid': 'trigger',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Trigger');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_1 = $.comment();
						var node_3 = $.first_child(fragment_1);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								let open = () => ($$arg0?.()).open;
								var fragment_2 = $.comment();
								var node_4 = $.first_child(fragment_2);

								{
									var consequent = ($$anchor) => {
										var div = root();

										$.attribute_effect(div, () => ({ ...props() }));
										$.append($$anchor, div);
									};

									$.if(node_4, ($$render) => {
										if (open()) $$render(consequent);
									});
								}

								$.append($$anchor, fragment_2);
							};

							$.component(node_3, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
								Collapsible_Content($$anchor, {
									'data-testid': 'content',
									forceMount: true,
									child,
									$$slots: { child: true }
								});
							});
						}

						$.append($$anchor, fragment_1);
					};

					var alternate = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_5 = $.first_child(fragment_3);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;
								let _open = () => ($$arg0?.()).open;
								var div_1 = root();

								$.attribute_effect(div_1, () => ({ ...props() }));
								$.append($$anchor, div_1);
							};

							$.component(node_5, () => Collapsible.Content, ($$anchor, Collapsible_Content_1) => {
								Collapsible_Content_1($$anchor, {
									'data-testid': 'content',
									forceMount: true,
									child,
									$$slots: { child: true }
								});
							});
						}

						$.append($$anchor, fragment_3);
					};

					$.if(node_2, ($$render) => {
						if (withOpenCheck()) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node, 2);

	$.reset(main);
	$.template_effect(() => $.set_text(text, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, main);
}

$.delegate(['click']);