import * as $ from 'svelte/internal/server';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import CodeMirror from "svelte-codemirror-editor";
import { javascript } from "@codemirror/lang-javascript";
import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
import { mode } from "mode-watcher";
import EyeClosedIcon from "@lucide/svelte/icons/eye-closed";
import EyeOpenIcon from "@lucide/svelte/icons/eye";

export default function Monitor_sql($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data = void 0 } = $$props;

		// Initialize defaults if not set
		if (!data.dbType) data.dbType = "pg";

		if (!data.connectionString) data.connectionString = "";
		if (!data.query) data.query = "SELECT 1";
		if (!data.timeout) data.timeout = 5000;

		let showConnectionString = false;

		const dbTypes = [
			{ value: "pg", label: "PostgreSQL" },
			{ value: "mysql2", label: "MySQL" },
			{ value: "mssql", label: "SQL Server" },
			{ value: "oracledb", label: "Oracle" },
			{ value: "sqlite3", label: "SQLite" }
		];

		const selectedDbType = $.derived(() => dbTypes.find((db) => db.value === data.dbType)?.label || "PostgreSQL");

		const connectionStringPlaceholder = $.derived(() => {
			switch (data.dbType) {
				case "pg":
					return "postgresql://user:password@localhost:5432/database";

				case "mysql2":
					return "mysql://user:password@localhost:3306/database";

				case "mssql":
					return "Server=localhost;Database=mydb;User Id=myuser;Password=mypassword;";

				case "oracledb":
					return "user/password@localhost:1521/orcl";

				case "sqlite3":
					return "/path/to/database.db";

				default:
					return "postgresql://user:password@localhost:5432/database";
			}
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'sql-dbtype',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Database Type`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: data.dbType,
					onValueChange: (v) => {
						if (v) data.dbType = v;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: 'sql-dbtype',
								class: 'w-full',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selectedDbType())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(dbTypes);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let db = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: db.value,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(db.label)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'sql-timeout',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Timeout (ms)`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				id: 'sql-timeout',
				type: 'number',
				placeholder: '5000',
				get value() {
					return data.timeout;
				},

				set value($$value) {
					data.timeout = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div></div> <div>`);

			if (InputGroup.Root) {
				$$renderer.push('<!--[-->');

				InputGroup.Root($$renderer, {
					children: ($$renderer) => {
						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								children: ($$renderer) => {
									if (InputGroup.Text) {
										$$renderer.push('<!--[-->');

										InputGroup.Text($$renderer, {
											class: 'border-r-2 pr-2',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Connection String for ${$.escape(selectedDbType())}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (InputGroup.Input) {
							$$renderer.push('<!--[-->');

							InputGroup.Input($$renderer, {
								id: 'sql-connection',
								placeholder: connectionStringPlaceholder(),
								type: showConnectionString ? "text" : "password",
								get value() {
									return data.connectionString;
								},

								set value($$value) {
									data.connectionString = $$value;
									$$settled = false;
								}
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (InputGroup.Addon) {
							$$renderer.push('<!--[-->');

							InputGroup.Addon($$renderer, {
								align: 'inline-end',
								children: ($$renderer) => {
									if (InputGroup.Button) {
										$$renderer.push('<!--[-->');

										InputGroup.Button($$renderer, {
											type: 'button',
											'aria-label': showConnectionString ? "Hide connection string" : "Show connection string",
											title: showConnectionString ? "Hide connection string" : "Show connection string",
											size: 'icon-xs',
											onclick: () => showConnectionString = !showConnectionString,
											children: ($$renderer) => {
												if (showConnectionString) {
													$$renderer.push('<!--[0-->');
													EyeClosedIcon($$renderer, { class: 'size-4' });
												} else {
													$$renderer.push('<!--[-1-->');
													EyeOpenIcon($$renderer, { class: 'size-4' });
												}

												$$renderer.push(`<!--]-->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` <p class="text-muted-foreground mt-1 text-xs">Connection string will be stored securely</p></div> <div class="flex flex-col gap-2">`);

			Label($$renderer, {
				for: 'sql-query',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Query <span class="text-destructive">*</span>`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="rounded-md border">`);

			CodeMirror($$renderer, {
				lang: javascript(),
				theme: mode.current === "dark" ? githubDark : githubLight,
				styles: { "&": { fontSize: "14px", height: "150px" } },
				get value() {
					return data.query;
				},

				set value($$value) {
					data.query = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----></div> <p class="text-muted-foreground mt-1 text-xs">Query to execute. If successful, monitor is UP.</p></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { data });
	});
}