import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Collapsible } from "bits-ui";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'hiddenUntilFound'
]);

var root = $.from_html(`<div data-testid="searchable-content">This is some searchable content that should be found by the browser's search
				functionality. Lorem ipsum dolor sit amet, consectetur adipiscing elit. <p data-testid="nested-content">Nested paragraph with more searchable text.</p></div>`);

var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<main><p data-testid="binding"> </p> <!> <button data-testid="alt-trigger">Toggle</button></main>`);

export default function Collapsible_hidden_until_found_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		hiddenUntilFound = $.prop($$props, 'hiddenUntilFound', 3, true),
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

				$.component(node_2, () => Collapsible.Content, ($$anchor, Collapsible_Content) => {
					Collapsible_Content($$anchor, {
						'data-testid': 'content',
						get hiddenUntilFound() {
							return hiddenUntilFound();
						},

						children: ($$anchor, $$slotProps) => {
							var div = root();

							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

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