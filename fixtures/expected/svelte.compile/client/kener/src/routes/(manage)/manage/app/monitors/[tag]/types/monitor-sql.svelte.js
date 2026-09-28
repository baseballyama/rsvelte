import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`Query <span class="text-destructive">*</span>`, 1);
var root_3 = $.from_html(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div><!> <p class="text-muted-foreground mt-1 text-xs">Connection string will be stored securely</p></div> <div class="flex flex-col gap-2"><!> <div class="rounded-md border"><!></div> <p class="text-muted-foreground mt-1 text-xs">Query to execute. If successful, monitor is UP.</p></div></div>`);

export default function Monitor_sql($$anchor, $$props) {
	$.push($$props, true);

	let data = $.prop($$props, 'data', 15);

	// Initialize defaults if not set
	if (!data().dbType) data(data().dbType = "pg", true);

	if (!data().connectionString) data(data().connectionString = "", true);
	if (!data().query) data(data().query = "SELECT 1", true);
	if (!data().timeout) data(data().timeout = 5000, true);

	let showConnectionString = $.state(false);

	const dbTypes = [
		{ value: "pg", label: "PostgreSQL" },
		{ value: "mysql2", label: "MySQL" },
		{ value: "mssql", label: "SQL Server" },
		{ value: "oracledb", label: "Oracle" },
		{ value: "sqlite3", label: "SQLite" }
	];

	const selectedDbType = $.derived(() => dbTypes.find((db) => db.value === data().dbType)?.label || "PostgreSQL");

	const connectionStringPlaceholder = $.derived(() => {
		switch (data().dbType) {
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

	var div = root_3();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		for: 'sql-dbtype',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Database Type');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return data().dbType;
			},

			onValueChange: (v) => {
				if (v) data(data().dbType = v, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						id: 'sql-dbtype',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(selectedDbType)));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_4 = $.first_child(fragment_2);

							$.each(node_4, 17, () => dbTypes, (db) => db.value, ($$anchor, db) => {
								var fragment_3 = $.comment();
								var node_5 = $.first_child(fragment_3);

								$.component(node_5, () => Select.Item, ($$anchor, Select_Item) => {
									Select_Item($$anchor, {
										get value() {
											return $.get(db).value;
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(db).label));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.child(div_3);

	Label(node_6, {
		for: 'sql-timeout',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Timeout (ms)');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Input(node_7, {
		id: 'sql-timeout',
		type: 'number',
		placeholder: '5000',
		get value() {
			return data().timeout;
		},

		set value($$value) {
			data(data().timeout = $$value, true);
		}
	});

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var node_8 = $.child(div_4);

	$.component(node_8, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
		InputGroup_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_1();
				var node_9 = $.first_child(fragment_5);

				$.component(node_9, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
					InputGroup_Addon($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_10 = $.first_child(fragment_6);

							$.component(node_10, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
								InputGroup_Text($$anchor, {
									class: 'border-r-2 pr-2',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text();

										$.template_effect(() => $.set_text(text_4, `Connection String for ${$.get(selectedDbType) ?? ''}`));
										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_11 = $.sibling(node_9, 2);

				{
					let $0 = $.derived(() => $.get(showConnectionString) ? "text" : "password");

					$.component(node_11, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
						InputGroup_Input($$anchor, {
							id: 'sql-connection',
							get placeholder() {
								return $.get(connectionStringPlaceholder);
							},

							get type() {
								return $.get($0);
							},

							get value() {
								return data().connectionString;
							},

							set value($$value) {
								data(data().connectionString = $$value, true);
							}
						});
					});
				}

				var node_12 = $.sibling(node_11, 2);

				$.component(node_12, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
					InputGroup_Addon_1($$anchor, {
						align: 'inline-end',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_13 = $.first_child(fragment_8);

							{
								let $0 = $.derived(() => $.get(showConnectionString) ? "Hide connection string" : "Show connection string");
								let $1 = $.derived(() => $.get(showConnectionString) ? "Hide connection string" : "Show connection string");

								$.component(node_13, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
									InputGroup_Button($$anchor, {
										type: 'button',
										get 'aria-label'() {
											return $.get($0);
										},

										get title() {
											return $.get($1);
										},
										size: 'icon-xs',
										onclick: () => $.set(showConnectionString, !$.get(showConnectionString)),
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = $.comment();
											var node_14 = $.first_child(fragment_9);

											{
												var consequent = ($$anchor) => {
													EyeClosedIcon($$anchor, { class: 'size-4' });
												};

												var alternate = ($$anchor) => {
													EyeOpenIcon($$anchor, { class: 'size-4' });
												};

												$.if(node_14, ($$render) => {
													if ($.get(showConnectionString)) $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});
								});
							}

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_15 = $.child(div_5);

	Label(node_15, {
		for: 'sql-query',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_12 = root_2();

			$.next();
			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	var div_6 = $.sibling(node_15, 2);
	var node_16 = $.child(div_6);

	{
		let $0 = $.derived(javascript);
		let $1 = $.derived(() => mode.current === "dark" ? githubDark : githubLight);

		CodeMirror(node_16, {
			get lang() {
				return $.get($0);
			},

			get theme() {
				return $.get($1);
			},
			styles: { "&": { fontSize: "14px", height: "150px" } },
			get value() {
				return data().query;
			},

			set value($$value) {
				data(data().query = $$value, true);
			}
		});
	}

	$.reset(div_6);
	$.next(2);
	$.reset(div_5);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}