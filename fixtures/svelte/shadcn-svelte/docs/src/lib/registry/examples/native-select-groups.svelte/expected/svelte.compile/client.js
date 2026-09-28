import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as NativeSelect from "$lib/registry/ui/native-select/index.js";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Native_select_groups($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => NativeSelect.Root, ($$anchor, NativeSelect_Root) => {
		NativeSelect_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => NativeSelect.Option, ($$anchor, NativeSelect_Option) => {
					NativeSelect_Option($$anchor, {
						value: '',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Select department');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => NativeSelect.OptGroup, ($$anchor, NativeSelect_OptGroup) => {
					NativeSelect_OptGroup($$anchor, {
						label: 'Engineering',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_1) => {
								NativeSelect_Option_1($$anchor, {
									value: 'frontend',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Frontend');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_2) => {
								NativeSelect_Option_2($$anchor, {
									value: 'backend',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Backend');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_3) => {
								NativeSelect_Option_3($$anchor, {
									value: 'devops',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('DevOps');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_6 = $.sibling(node_2, 2);

				$.component(node_6, () => NativeSelect.OptGroup, ($$anchor, NativeSelect_OptGroup_1) => {
					NativeSelect_OptGroup_1($$anchor, {
						label: 'Sales',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_7 = $.first_child(fragment_3);

							$.component(node_7, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_4) => {
								NativeSelect_Option_4($$anchor, {
									value: 'sales-rep',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Sales Rep');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_7, 2);

							$.component(node_8, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_5) => {
								NativeSelect_Option_5($$anchor, {
									value: 'account-manager',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Account Manager');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							var node_9 = $.sibling(node_8, 2);

							$.component(node_9, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_6) => {
								NativeSelect_Option_6($$anchor, {
									value: 'sales-director',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Sales Director');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_6, 2);

				$.component(node_10, () => NativeSelect.OptGroup, ($$anchor, NativeSelect_OptGroup_2) => {
					NativeSelect_OptGroup_2($$anchor, {
						label: 'Operations',
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root();
							var node_11 = $.first_child(fragment_4);

							$.component(node_11, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_7) => {
								NativeSelect_Option_7($$anchor, {
									value: 'support',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text('Customer Support');

										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});
							});

							var node_12 = $.sibling(node_11, 2);

							$.component(node_12, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_8) => {
								NativeSelect_Option_8($$anchor, {
									value: 'product-manager',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text('Product Manager');

										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});
							});

							var node_13 = $.sibling(node_12, 2);

							$.component(node_13, () => NativeSelect.Option, ($$anchor, NativeSelect_Option_9) => {
								NativeSelect_Option_9($$anchor, {
									value: 'ops-manager',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text('Operations Manager');

										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
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