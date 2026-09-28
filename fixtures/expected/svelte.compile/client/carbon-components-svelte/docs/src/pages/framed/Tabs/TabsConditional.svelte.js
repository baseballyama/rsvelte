import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox, Stack, Tab, TabContent, Tabs } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);
var root_1 = $.from_html(`<p>Dashboard content with analytics and overview.</p>`);
var root_2 = $.from_html(`<p>Admin panel for managing users and permissions.</p>`);
var root_3 = $.from_html(`<p>Settings and configuration options.</p>`);
var root_4 = $.from_html(`<p>User profile and account information.</p>`);
var root_5 = $.from_html(`<div><!> <!></div> <div><strong>Selected index:</strong> </div> <!>`, 1);

export default function TabsConditional($$anchor) {
	let selected = 0;
	let showAdminTab = true;
	let showSettingsTab = true;

	Stack($$anchor, {
		gap: 3,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_5();
			var div = $.first_child(fragment_1);
			var node = $.child(div);

			Checkbox(node, {
				labelText: 'Show Admin tab',
				get checked() {
					return showAdminTab;
				},

				set checked($$value) {
					showAdminTab = $$value;
				}
			});

			var node_1 = $.sibling(node, 2);

			Checkbox(node_1, {
				labelText: 'Show Settings tab',
				get checked() {
					return showSettingsTab;
				},

				set checked($$value) {
					showSettingsTab = $$value;
				}
			});

			$.reset(div);

			var div_1 = $.sibling(div, 2);
			var text = $.sibling($.child(div_1));

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			Tabs(node_2, {
				get selected() {
					return selected;
				},

				set selected($$value) {
					selected = $$value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Tab(node_3, { label: 'Dashboard' });

					var node_4 = $.sibling(node_3, 2);

					{
						var consequent = ($$anchor) => {
							Tab($$anchor, { label: 'Admin' });
						};

						$.if(node_4, ($$render) => {
							if (showAdminTab) $$render(consequent);
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent_1 = ($$anchor) => {
							Tab($$anchor, { label: 'Settings' });
						};

						$.if(node_5, ($$render) => {
							if (showSettingsTab) $$render(consequent_1);
						});
					}

					var node_6 = $.sibling(node_5, 2);

					Tab(node_6, { label: 'Profile' });
					$.append($$anchor, fragment_2);
				},

				$$slots: {
					default: true,
					content: ($$anchor, $$slotProps) => {
						var fragment_5 = root();
						var node_7 = $.first_child(fragment_5);

						TabContent(node_7, {
							children: ($$anchor, $$slotProps) => {
								var p = root_1();

								$.append($$anchor, p);
							},
							$$slots: { default: true }
						});

						var node_8 = $.sibling(node_7, 2);

						{
							var consequent_2 = ($$anchor) => {
								TabContent($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var p_1 = root_2();

										$.append($$anchor, p_1);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_8, ($$render) => {
								if (showAdminTab) $$render(consequent_2);
							});
						}

						var node_9 = $.sibling(node_8, 2);

						{
							var consequent_3 = ($$anchor) => {
								TabContent($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var p_2 = root_3();

										$.append($$anchor, p_2);
									},
									$$slots: { default: true }
								});
							};

							$.if(node_9, ($$render) => {
								if (showSettingsTab) $$render(consequent_3);
							});
						}

						var node_10 = $.sibling(node_9, 2);

						TabContent(node_10, {
							children: ($$anchor, $$slotProps) => {
								var p_3 = root_4();

								$.append($$anchor, p_3);
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_5);
					}
				}
			});

			$.template_effect(() => $.set_text(text, ` ${selected ?? ''}`));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}