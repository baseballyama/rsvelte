import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import Badge from "$lib/components/ui/badge/badge.svelte";
import { cn } from "$lib/utils";

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="size-3.5" viewBox="0 0 24 24" fill="none" role="img" color="currentColor"><path opacity="0.4" d="M11.25 6.01075C9.49925 4.88337 7.42689 4.24722 5.33301 4.25001C4.26146 4.25001 2.79138 4.33668 2.00489 5.16602C1.60339 5.58943 1.41468 6.0638 1.32813 6.60548C1.24799 7.10712 1.25 7.71199 1.25 8.40235L1.25002 17.0762C1.25002 17.6737 1.25002 18.167 1.28029 18.5518C1.30995 18.9284 1.37444 19.3249 1.58889 19.6602C1.7129 19.8555 2.04435 20.2749 2.37795 20.3897C2.70923 20.5525 3.11124 20.5983 3.48537 20.6221C3.94562 20.6514 4.55615 20.6514 5.31935 20.6514H5.334C7.50112 20.6484 9.59402 21.3951 11.25 22.75L11.25 6.01075Z" fill="currentColor"></path><path opacity="0.4" d="M19.75 3.39495C19.75 2.23538 18.8039 1.11571 17.5039 1.26311C15.2508 1.65616 13.667 2.88015 12.75 4.10491V22.7499C12.8975 22.3284 13.3188 21.1609 13.7061 20.5809C14.4717 19.4343 15.9547 18.2058 18.2461 17.951C19.0525 17.789 19.7499 17.1031 19.75 16.1776V3.39495Z" fill="currentColor"></path><path d="M20.75 4.47266C21.2305 4.60809 21.671 4.82233 21.9951 5.16406C22.3966 5.58747 22.5853 6.06184 22.6719 6.60352C22.752 7.10516 22.75 7.71003 22.75 8.40039V17.0742C22.75 17.6717 22.75 18.165 22.7197 18.5498C22.6901 18.9264 22.6256 19.323 22.4111 19.6582C22.2871 19.8536 21.9557 20.273 21.6221 20.3877C21.2908 20.5505 20.8888 20.5963 20.5146 20.6201C20.0544 20.6494 19.4439 20.6494 18.6807 20.6494H18.666C17.0935 20.6472 15.5609 21.0412 14.2051 21.7744C14.3252 21.5063 14.4402 21.28 14.5371 21.1348L14.5381 21.1357C15.1594 20.2053 16.7013 19.0945 18.666 18.876C19.6748 18.7638 20.6192 17.69 20.7373 16.4482L20.75 16.1768V4.47266Z" fill="currentColor"></path></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="currentColor"><path opacity="0.4" d="M13.9741 2.25C14.7443 2.24999 15.3763 2.24998 15.8964 2.30109C16.4411 2.35461 16.9214 2.46829 17.376 2.72984C17.8306 2.99144 18.1701 3.34942 18.4896 3.79326C18.7946 4.21694 19.1113 4.76293 19.4972 5.42801L21.4579 8.80767C21.8453 9.47535 22.1633 10.0235 22.3803 10.5002C22.6076 10.9996 22.75 11.4737 22.75 12C22.75 12.5263 22.6076 13.0004 22.3803 13.4998C22.1633 13.9765 21.8453 14.5246 21.4579 15.1923L21.4579 15.1924L19.4971 18.572L19.4971 18.5721C19.1113 19.2371 18.7945 19.7831 18.4896 20.2067C18.17 20.6506 17.8306 21.0086 17.376 21.2702C16.9214 21.5317 16.4411 21.6454 15.8964 21.6989C15.3763 21.75 14.7443 21.75 13.974 21.75L10.026 21.75C9.25573 21.75 8.62366 21.75 8.10357 21.6989C7.55891 21.6454 7.07864 21.5317 6.62404 21.2702C6.16937 21.0086 5.82995 20.6506 5.51044 20.2067C5.20543 19.7831 4.88867 19.237 4.50282 18.5719L2.54214 15.1924C2.15475 14.5247 1.83673 13.9766 1.61974 13.4998C1.39243 13.0004 1.25 12.5263 1.25 12C1.25 11.4737 1.39243 10.9996 1.61974 10.5002C1.83673 10.0235 2.15475 9.47532 2.54214 8.80762L2.54214 8.80762L4.50285 5.42801C4.88869 4.76293 5.20544 4.21693 5.51044 3.79326C5.82995 3.34942 6.16937 2.99144 6.62404 2.72984C7.07864 2.46829 7.55891 2.35461 8.10357 2.30109C8.62365 2.24998 9.25571 2.24999 10.0259 2.25H10.0259H13.9741H13.9741Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8.40006 7.20006C8.84189 6.86869 9.46869 6.95823 9.80006 7.40006L15.8001 15.4001C16.1314 15.8419 16.0419 16.4687 15.6001 16.8001C15.1582 17.1314 14.5314 17.0419 14.2001 16.6001L8.20006 8.60006C7.86869 8.15823 7.95823 7.53143 8.40006 7.20006Z" fill="currentColor"></path></svg>`);
var root_2 = $.from_html(`<span><!></span> `, 1);
var root_3 = $.from_html(`<a><span> </span> <!></a>`);
var root_4 = $.from_html(`<!> <!>`, 1);

export default function Nav_main($$anchor, $$props) {
	$.push($$props, true);

	let label = $.prop($$props, 'label', 3, "Guide");

	const isActive = (item) => {
		if (item.external || !item.url.startsWith("/")) return false;

		return page.url.pathname === item.url;
	};

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Sidebar.Group, ($$anchor, Sidebar_Group) => {
		Sidebar_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Sidebar.GroupLabel, ($$anchor, Sidebar_GroupLabel) => {
					Sidebar_GroupLabel($$anchor, {
						class: 'gap-1.5',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var span = $.first_child(fragment_2);
							var node_2 = $.child(span);

							{
								var consequent = ($$anchor) => {
									var svg = root();

									$.append($$anchor, svg);
								};

								var alternate = ($$anchor) => {
									var svg_1 = root_1();

									$.append($$anchor, svg_1);
								};

								$.if(node_2, ($$render) => {
									if (label() === "Guide") $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.reset(span);

							var text = $.sibling(span);

							$.template_effect(() => $.set_text(text, ` ${label() ?? ''}`));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Sidebar.Menu, ($$anchor, Sidebar_Menu) => {
					Sidebar_Menu($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_4 = $.first_child(fragment_3);

							$.each(node_4, 17, () => $$props.items, $.index, ($$anchor, item) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Sidebar.MenuItem, ($$anchor, Sidebar_MenuItem) => {
									Sidebar_MenuItem($$anchor, {
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											{
												const child = ($$anchor, $$arg0) => {
													let props = () => ($$arg0?.()).props;
													var a = root_3();

													$.attribute_effect(a, () => ({
														href: $.get(item).url,
														target: $.get(item).external ? "_blank" : undefined,
														rel: $.get(item).external ? "noopener noreferrer" : undefined,
														...props()
													}));

													var span_1 = $.child(a);
													var text_1 = $.only_child(span_1, true);
													var node_7 = $.sibling(span_1, 2);

													{
														var consequent_1 = ($$anchor) => {
															Badge($$anchor, {
																variant: 'secondary',
																class: 'ml-2 rounded-full px-1.5 py-0 text-[10px]',
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_2 = $.text();

																	$.template_effect(() => $.set_text(text_2, $.get(item).badge));
																	$.append($$anchor, text_2);
																},
																$$slots: { default: true }
															});
														};

														$.if(node_7, ($$render) => {
															if ($.get(item).badge) $$render(consequent_1);
														});
													}

													$.reset(a);
													$.template_effect(() => $.set_text(text_1, $.get(item).title));
													$.append($$anchor, a);
												};

												let $0 = $.derived(() => cn("text-sm", {
													"bg-sidebar-accent text-sidebar-accent-foreground": isActive($.get(item))
												}));

												$.component(node_6, () => Sidebar.MenuButton, ($$anchor, Sidebar_MenuButton) => {
													Sidebar_MenuButton($$anchor, {
														get class() {
															return $.get($0);
														},
														child,
														$$slots: { child: true }
													});
												});
											}

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
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
	$.pop();
}