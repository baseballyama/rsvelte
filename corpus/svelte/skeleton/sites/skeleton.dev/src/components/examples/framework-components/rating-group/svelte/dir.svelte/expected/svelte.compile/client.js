import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RatingGroup } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Dir($$anchor, $$props) {
	$.push($$props, true);

	RatingGroup($$anchor, {
		count: 5,
		dir: 'rtl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			$.component(node, () => RatingGroup.Label, ($$anchor, RatingGroup_Label) => {
				RatingGroup_Label($$anchor, {
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Label');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});
			});

			var node_1 = $.sibling(node, 2);

			$.component(node_1, () => RatingGroup.Control, ($$anchor, RatingGroup_Control) => {
				RatingGroup_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_2 = $.first_child(fragment_2);

						{
							const children = ($$anchor, ratingGroup = $.noop) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.each(node_3, 16, () => ratingGroup()().items, (index) => index, ($$anchor, index) => {
									var fragment_4 = $.comment();
									var node_4 = $.first_child(fragment_4);

									$.component(node_4, () => RatingGroup.Item, ($$anchor, RatingGroup_Item) => {
										RatingGroup_Item($$anchor, {
											get index() {
												return index;
											}
										});
									});

									$.append($$anchor, fragment_4);
								});

								$.append($$anchor, fragment_3);
							};

							$.component(node_2, () => RatingGroup.Context, ($$anchor, RatingGroup_Context) => {
								RatingGroup_Context($$anchor, { children, $$slots: { default: true } });
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_1, 2);

			$.component(node_5, () => RatingGroup.HiddenInput, ($$anchor, RatingGroup_HiddenInput) => {
				RatingGroup_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}