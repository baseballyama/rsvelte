import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from '$lib/components/button.svelte';
import { Textarea } from '$lib/components/ui/textarea';
import { Label } from '$lib/components/ui/label';
import * as Card from '$lib/components/ui/card';
import * as StarRating from '$lib/components/ui/star-rating';
import * as Field from '$lib/components/ui/field';

var root = $.from_html(`<!> <!>`, 1);

export default function Review_form($$anchor) {
	let loading = $.state(false);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Write a Review');

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

										var text_1 = $.text('Tell us about your experience using acme.com');

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

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'flex flex-col gap-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Field.Group, ($$anchor, Field_Group) => {
								Field_Group($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Field.Field, ($$anchor, Field_Field) => {
											Field_Field($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_7 = $.first_child(fragment_5);

													Label(node_7, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_2 = $.text('Comment');

															$.append($$anchor, text_2);
														},
														$$slots: { default: true }
													});

													var node_8 = $.sibling(node_7, 2);

													Textarea(node_8, { placeholder: 'Tell us about your experience...' });
													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											});
										});

										var node_9 = $.sibling(node_6, 2);

										$.component(node_9, () => Field.Field, ($$anchor, Field_Field_1) => {
											Field_Field_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_10 = $.first_child(fragment_6);

													Label(node_10, {
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_3 = $.text('Overall Rating');

															$.append($$anchor, text_3);
														},
														$$slots: { default: true }
													});

													var node_11 = $.sibling(node_10, 2);

													{
														const children = ($$anchor, $$arg0) => {
															let items = () => ($$arg0?.()).items;
															var fragment_7 = $.comment();
															var node_12 = $.first_child(fragment_7);

															$.each(node_12, 17, items, (item) => item.index, ($$anchor, item) => {
																var fragment_8 = $.comment();
																var node_13 = $.first_child(fragment_8);

																$.component(node_13, () => StarRating.Star, ($$anchor, StarRating_Star) => {
																	StarRating_Star($$anchor, $.spread_props(() => $.get(item)));
																});

																$.append($$anchor, fragment_8);
															});

															$.append($$anchor, fragment_7);
														};

														$.component(node_11, () => StarRating.Root, ($$anchor, StarRating_Root) => {
															StarRating_Root($$anchor, { value: 1, children, $$slots: { default: true } });
														});
													}

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_5, 2);

							Button(node_14, {
								get loading() {
									return $.get(loading);
								},
								class: 'w-full',
								onclick: () => {
									$.set(loading, true);

									setTimeout(
										() => {
											$.set(loading, false);
										},
										500
									);
								},

								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Submit');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
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