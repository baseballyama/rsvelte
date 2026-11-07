import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Card from "$lib/registry/ui/card/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Badge } from "$lib/registry/ui/badge/index.js";

var root = $.from_html(`<div class="flex items-center gap-1.5 text-sm text-muted-foreground">Locked <!></div>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<div class="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,var(--border)_10px,var(--border)_11px)]"><!></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);

export default function Front_door($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_3();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Front Door');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Smart Lock Pro');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var div = root();
										var node_5 = $.sibling($.child(div));

										IconPlaceholder(node_5, {
											lucide: 'LockIcon',
											tabler: 'IconLock',
											hugeicons: 'SquareLock02Icon',
											phosphor: 'LockKeyIcon',
											remixicon: 'RiLockLine',
											class: 'size-4'
										});

										$.reset(div);
										$.append($$anchor, div);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_1, 2);

				$.component(node_6, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var div_1 = root_2();
							var node_7 = $.child(div_1);

							Badge(node_7, {
								variant: 'destructive',
								class: 'absolute top-2 right-2',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Live');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							$.reset(div_1);
							$.append($$anchor, div_1);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
}