import * as $ from 'svelte/internal/server';

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

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let openUser = false; // modal control
		let openDelete = false; // modal control
		let current_user = {};
		const users = mapUsersWithAvatars(Users);
		const path = "/crud/users";
		const description = "CRUD users examaple - Flowbite Svelte Admin Dashboard";
		const title = "Flowbite Svelte Admin Dashboard - CRUD Users";
		const subtitle = "CRUD Users";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			MetaTag($$renderer, { path, description, title, subtitle });
			$$renderer.push(`<!----> <main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800"><h1 class="hidden">CRUD: Users</h1> <div class="p-4">`);

			Breadcrumb($$renderer, {
				class: 'mb-5',
				children: ($$renderer) => {
					BreadcrumbItem($$renderer, {
						home: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Home`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						href: '/crud/users',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Users`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					BreadcrumbItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->List`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Heading($$renderer, {
				tag: 'h1',
				class: 'text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white',
				children: ($$renderer) => {
					$$renderer.push(`<!---->All users`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			{
				function end($$renderer) {
					$$renderer.push(`<div class="flex items-center space-x-2">`);

					Button($$renderer, {
						size: 'sm',
						class: 'gap-2 px-3 whitespace-nowrap',
						onclick: () => (current_user = {}, openUser = true),
						children: ($$renderer) => {
							PlusOutline($$renderer, { size: 'sm' });
							$$renderer.push(`<!---->Add user`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						size: 'sm',
						color: 'alternative',
						class: 'gap-2 px-3',
						children: ($$renderer) => {
							DownloadSolid($$renderer, { size: 'md', class: '-ml-1' });
							$$renderer.push(`<!---->Export`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				Toolbar($$renderer, {
					embedded: true,
					class: 'w-full py-4 text-gray-500  dark:text-gray-300',
					end,
					children: ($$renderer) => {
						Input($$renderer, {
							placeholder: 'Search for users',
							class: 'me-4 w-80 border xl:w-96'
						});

						$$renderer.push(`<!----> <div class="border-l border-gray-100 pl-2 dark:border-gray-700">`);

						ToolbarButton($$renderer, {
							color: 'dark',
							class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
							children: ($$renderer) => {
								CogSolid($$renderer, { size: 'lg' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							color: 'dark',
							class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
							children: ($$renderer) => {
								TrashBinSolid($$renderer, { size: 'lg' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							color: 'dark',
							class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
							children: ($$renderer) => {
								ExclamationCircleSolid($$renderer, { size: 'lg' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ToolbarButton($$renderer, {
							color: 'dark',
							class: 'm-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700',
							children: ($$renderer) => {
								DotsVerticalOutline($$renderer, { size: 'lg' });
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					},
					$$slots: { end: true, default: true }
				});
			}

			$$renderer.push(`<!----></div> `);

			Table($$renderer, {
				children: ($$renderer) => {
					TableHead($$renderer, {
						class: 'border-y border-gray-200 bg-gray-100 dark:border-gray-700',
						children: ($$renderer) => {
							TableHeadCell($$renderer, {
								class: 'w-4 p-4',
								children: ($$renderer) => {
									Checkbox($$renderer, {});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> <!--[-->`);

							const each_array = $.ensure_array_like([
								"Name",
								"Biography",
								"Position",
								"Country",
								"Status",
								"Actions"
							]);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let title = each_array[$$index];

								TableHeadCell($$renderer, {
									class: 'p-4 font-medium',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(title)}`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					TableBody($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(users);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let user = each_array_1[$$index_1];

								TableBodyRow($$renderer, {
									class: 'text-base',
									children: ($$renderer) => {
										TableBodyCell($$renderer, {
											class: 'w-4 p-4',
											children: ($$renderer) => {
												Checkbox($$renderer, {});
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											class: 'mr-12 flex items-center space-x-6 p-4 whitespace-nowrap',
											children: ($$renderer) => {
												Avatar($$renderer, { src: user.avatar });
												$$renderer.push(`<!----> <div class="text-sm font-normal text-gray-500 dark:text-gray-300"><div class="text-base font-semibold text-gray-900 dark:text-white">${$.escape(user.name)}</div> <div class="text-sm font-normal text-gray-500 dark:text-gray-300">${$.escape(user.email)}</div></div>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											class: 'max-w-sm truncate overflow-hidden p-4 text-base font-normal text-gray-500 xl:max-w-xs dark:text-gray-300',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(user.biography)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											class: 'p-4',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(user.position)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											class: 'p-4',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(user.country)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											class: 'p-4 font-normal',
											children: ($$renderer) => {
												$$renderer.push(`<div class="flex items-center gap-2">`);
												Indicator($$renderer, { color: user.status === "Active" ? "green" : "red" });
												$$renderer.push(`<!----> ${$.escape(user.status)}</div>`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----> `);

										TableBodyCell($$renderer, {
											class: 'space-x-2 p-4',
											children: ($$renderer) => {
												Button($$renderer, {
													size: 'sm',
													class: 'gap-2 px-3',
													onclick: () => (current_user = user, openUser = true),
													children: ($$renderer) => {
														EditOutline($$renderer, { size: 'sm' });
														$$renderer.push(`<!----> Edit user`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													color: 'red',
													size: 'sm',
													class: 'gap-2 px-3',
													onclick: () => (current_user = user, openDelete = true),
													children: ($$renderer) => {
														TrashBinSolid($$renderer, { size: 'sm' });
														$$renderer.push(`<!----> Delete user`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!---->`);
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></main> `);

			UserModal($$renderer, {
				data: current_user,
				get open() {
					return openUser;
				},

				set open($$value) {
					openUser = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			DeleteModal($$renderer, {
				get open() {
					return openDelete;
				},

				set open($$value) {
					openDelete = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}