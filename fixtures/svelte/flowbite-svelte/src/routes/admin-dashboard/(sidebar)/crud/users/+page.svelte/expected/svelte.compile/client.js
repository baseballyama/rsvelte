import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Avatar,
	Breadcrumb,
	BreadcrumbItem,
	Button,
	Checkbox,
	Heading,
	Indicator,
	Input,
	Table,
	TableBody,
	TableBodyCell,
	TableBodyRow,
	TableHead,
	TableHeadCell,
	Toolbar,
	ToolbarButton
} from "flowbite-svelte";

import {
	CogSolid,
	DotsVerticalOutline,
	DownloadSolid,
	EditOutline,
	ExclamationCircleSolid,
	PlusOutline,
	TrashBinSolid
} from "flowbite-svelte-icons";

import Users from "../../../data/users.json";
import { DeleteModal, UserModal, mapUsersWithAvatars } from "flowbite-svelte-admin-dashboard";
import MetaTag from "../../../utils/MetaTag.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!>Add user`, 1);
var root_2 = $.from_html(`<!>Export`, 1);
var root_3 = $.from_html(`<div class="flex items-center space-x-2"><!> <!></div>`);
var root_4 = $.from_html(`<!> <div class="border-l border-gray-100 pl-2 dark:border-gray-700"><!> <!> <!> <!></div>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> <div class="text-sm font-normal text-gray-500 dark:text-gray-300"><div class="text-base font-semibold text-gray-900 dark:text-white"> </div> <div class="text-sm font-normal text-gray-500 dark:text-gray-300"> </div></div>`, 1);
var root_7 = $.from_html(`<div class="flex items-center gap-2"><!> </div>`);
var root_8 = $.from_html(`<!> Edit user`, 1);
var root_9 = $.from_html(`<!> Delete user`, 1);
var root_10 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`<!> <main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800"><h1 class="hidden">CRUD: Users</h1> <div class="p-4"><!> <!> <!></div> <!></main> <!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let openUser = $.state(false // modal control
	);
	let openDelete = $.state(false // modal control
	);
	let current_user = $.state($.proxy({}));
	const users = mapUsersWithAvatars(Users);
	const path = "/crud/users";
	const description = "CRUD users examaple - Flowbite Svelte Admin Dashboard";
	const title = "Flowbite Svelte Admin Dashboard - CRUD Users";
	const subtitle = "CRUD Users";
	var fragment = root_11();
	var node = $.first_child(fragment);

	MetaTag(node, { path, description, title, subtitle });

	var main = $.sibling(node, 2);
	var div = $.sibling($.child(main), 2);
	var node_1 = $.child(div);

	Breadcrumb(node_1, {
		class: 'mb-5',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			BreadcrumbItem(node_2, {
				home: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Home');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			BreadcrumbItem(node_3, {
				href: '/crud/users',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Users');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			BreadcrumbItem(node_4, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('List');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_1, 2);

	Heading(node_5, {
		tag: 'h1',
		class: 'text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('All users');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	{
		const end = ($$anchor) => {
			var div_1 = root_3();
			var node_7 = $.child(div_1);

			Button(node_7, {
				size: 'sm',
				class: 'gap-2 px-3 whitespace-nowrap',
				onclick: () => ($.set(current_user, {}, true), $.set(openUser, true)),
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_8 = $.first_child(fragment_2);

					PlusOutline(node_8, { size: 'sm' });
					$.next();
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_7, 2);

			Button(node_9, {
				size: 'sm',
				color: 'alternative',
				class: 'gap-2 px-3',
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = root_2();
					var node_10 = $.first_child(fragment_3);

					DownloadSolid(node_10, { size: 'md', class: '-ml-1' });
					$.next();
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		Toolbar(node_6, {
			embedded: true,
			class: 'w-full py-4 text-gray-500  dark:text-gray-300',
			end,
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_4();
				var node_11 = $.first_child(fragment_4);

				Input(node_11, {
					placeholder: 'Search for users',
					class: 'me-4 w-80 border xl:w-96'
				});

				var div_2 = $.sibling(node_11, 2);
				var node_12 = $.child(div_2);

				ToolbarButton(node_12, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						CogSolid($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				var node_13 = $.sibling(node_12, 2);

				ToolbarButton(node_13, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						TrashBinSolid($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				var node_14 = $.sibling(node_13, 2);

				ToolbarButton(node_14, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						ExclamationCircleSolid($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				var node_15 = $.sibling(node_14, 2);

				ToolbarButton(node_15, {
					color: 'dark',
					class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
					children: ($$anchor, $$slotProps) => {
						DotsVerticalOutline($$anchor, { size: 'lg' });
					},
					$$slots: { default: true }
				});

				$.reset(div_2);
				$.append($$anchor, fragment_4);
			},
			$$slots: { end: true, default: true }
		});
	}

	$.reset(div);

	var node_16 = $.sibling(div, 2);

	Table(node_16, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root_5();
			var node_17 = $.first_child(fragment_9);

			TableHead(node_17, {
				class: 'border-y border-gray-200 bg-gray-100 dark:border-gray-700',
				children: ($$anchor, $$slotProps) => {
					var fragment_10 = root_5();
					var node_18 = $.first_child(fragment_10);

					TableHeadCell(node_18, {
						class: 'w-4 p-4',
						children: ($$anchor, $$slotProps) => {
							Checkbox($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					$.each(
						node_19,
						16,
						() => [
							"Name",
							"Biography",
							"Position",
							"Country",
							"Status",
							"Actions"
						],
						$.index,
						($$anchor, title, $$index, $$array) => {
							TableHeadCell($$anchor, {
								class: 'p-4 font-medium',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text();

									$.template_effect(() => $.set_text(text_4, title));
									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						}
					);

					$.append($$anchor, fragment_10);
				},
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_17, 2);

			TableBody(node_20, {
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = $.comment();
					var node_21 = $.first_child(fragment_14);

					$.each(node_21, 17, () => users, $.index, ($$anchor, user) => {
						TableBodyRow($$anchor, {
							class: 'text-base',
							children: ($$anchor, $$slotProps) => {
								var fragment_16 = root_10();
								var node_22 = $.first_child(fragment_16);

								TableBodyCell(node_22, {
									class: 'w-4 p-4',
									children: ($$anchor, $$slotProps) => {
										Checkbox($$anchor, {});
									},
									$$slots: { default: true }
								});

								var node_23 = $.sibling(node_22, 2);

								TableBodyCell(node_23, {
									class: 'mr-12 flex items-center space-x-6 p-4 whitespace-nowrap',
									children: ($$anchor, $$slotProps) => {
										var fragment_18 = root_6();
										var node_24 = $.first_child(fragment_18);

										Avatar(node_24, {
											get src() {
												return $.get(user).avatar;
											}
										});

										var div_3 = $.sibling(node_24, 2);
										var div_4 = $.child(div_3);
										var text_5 = $.only_child(div_4, true);
										var div_5 = $.sibling(div_4, 2);
										var text_6 = $.only_child(div_5, true);

										$.reset(div_3);

										$.template_effect(() => {
											$.set_text(text_5, $.get(user).name);
											$.set_text(text_6, $.get(user).email);
										});

										$.append($$anchor, fragment_18);
									},
									$$slots: { default: true }
								});

								var node_25 = $.sibling(node_23, 2);

								TableBodyCell(node_25, {
									class: 'max-w-sm truncate overflow-hidden p-4 text-base font-normal text-gray-500 xl:max-w-xs dark:text-gray-300',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_7 = $.text();

										$.template_effect(() => $.set_text(text_7, $.get(user).biography));
										$.append($$anchor, text_7);
									},
									$$slots: { default: true }
								});

								var node_26 = $.sibling(node_25, 2);

								TableBodyCell(node_26, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_8 = $.text();

										$.template_effect(() => $.set_text(text_8, $.get(user).position));
										$.append($$anchor, text_8);
									},
									$$slots: { default: true }
								});

								var node_27 = $.sibling(node_26, 2);

								TableBodyCell(node_27, {
									class: 'p-4',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_9 = $.text();

										$.template_effect(() => $.set_text(text_9, $.get(user).country));
										$.append($$anchor, text_9);
									},
									$$slots: { default: true }
								});

								var node_28 = $.sibling(node_27, 2);

								TableBodyCell(node_28, {
									class: 'p-4 font-normal',
									children: ($$anchor, $$slotProps) => {
										var div_6 = root_7();
										var node_29 = $.child(div_6);

										{
											let $0 = $.derived(() => $.get(user).status === "Active" ? "green" : "red");

											Indicator(node_29, {
												get color() {
													return $.get($0);
												}
											});
										}

										var text_10 = $.sibling(node_29);

										$.reset(div_6);
										$.template_effect(() => $.set_text(text_10, ` ${$.get(user).status ?? ''}`));
										$.append($$anchor, div_6);
									},
									$$slots: { default: true }
								});

								var node_30 = $.sibling(node_28, 2);

								TableBodyCell(node_30, {
									class: 'space-x-2 p-4',
									children: ($$anchor, $$slotProps) => {
										var fragment_22 = root_5();
										var node_31 = $.first_child(fragment_22);

										Button(node_31, {
											size: 'sm',
											class: 'gap-2 px-3',
											onclick: () => (
												$.set(current_user, $.get(user), true),
												$.set(openUser, true)
											),

											children: ($$anchor, $$slotProps) => {
												var fragment_23 = root_8();
												var node_32 = $.first_child(fragment_23);

												EditOutline(node_32, { size: 'sm' });
												$.next();
												$.append($$anchor, fragment_23);
											},
											$$slots: { default: true }
										});

										var node_33 = $.sibling(node_31, 2);

										Button(node_33, {
											color: 'red',
											size: 'sm',
											class: 'gap-2 px-3',
											onclick: () => (
												$.set(current_user, $.get(user), true),
												$.set(openDelete, true)
											),

											children: ($$anchor, $$slotProps) => {
												var fragment_24 = root_9();
												var node_34 = $.first_child(fragment_24);

												TrashBinSolid(node_34, { size: 'sm' });
												$.next();
												$.append($$anchor, fragment_24);
											},
											$$slots: { default: true }
										});

										$.append($$anchor, fragment_22);
									},
									$$slots: { default: true }
								});

								$.append($$anchor, fragment_16);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	$.reset(main);

	var node_35 = $.sibling(main, 2);

	UserModal(node_35, {
		get data() {
			return $.get(current_user);
		},

		get open() {
			return $.get(openUser);
		},

		set open($$value) {
			$.set(openUser, $$value, true);
		}
	});

	var node_36 = $.sibling(node_35, 2);

	DeleteModal(node_36, {
		get open() {
			return $.get(openDelete);
		},

		set open($$value) {
			$.set(openDelete, $$value, true);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}