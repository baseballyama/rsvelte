import 'svelte/internal/disclose-version';
import { LinkPreview } from "bits-ui";
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'open',
	'contentProps',
	'portalProps'
]);

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<main data-testid="main"><!> <button data-testid="binding"> </button> <div data-testid="outside" class="ml-48">outside</div></main> <div data-testid="portal-target" id="portal-target"></div>`, 1);

export default function Link_preview_test($$anchor, $$props) {
	let open = $.prop($$props, 'open', 7, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = root_1();
	var main = $.first_child(fragment);
	var node = $.child(main);

	$.component(node, () => LinkPreview.Root, ($$anchor, LinkPreview_Root) => {
		LinkPreview_Root($$anchor, $.spread_props(() => restProps, {
			openDelay: 0,
			closeDelay: 0,
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => LinkPreview.Trigger, ($$anchor, LinkPreview_Trigger) => {
					LinkPreview_Trigger($$anchor, {
						'data-testid': 'trigger',
						href: 'https://github.com/sveltejs',
						target: '_blank',
						rel: 'noreferrer noopener',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('@sveltejs');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => LinkPreview.Portal, ($$anchor, LinkPreview_Portal) => {
					LinkPreview_Portal($$anchor, $.spread_props(() => $$props.portalProps, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => LinkPreview.Content, ($$anchor, LinkPreview_Content) => {
								LinkPreview_Content($$anchor, $.spread_props({ 'data-testid': 'content', class: 'w-80' }, () => $$props.contentProps, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Content');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								}));
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}));
	});

	var button = $.sibling(node, 2);
	var text_2 = $.only_child(button, true);

	$.next(2);
	$.reset(main);
	$.next(2);
	$.template_effect(() => $.set_text(text_2, open()));
	$.delegated('click', button, () => open(!open()));
	$.append($$anchor, fragment);
}

$.delegate(['click']);