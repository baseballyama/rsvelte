import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "$lib/components/ui/card";
import { Checkbox } from "$lib/components/ui/checkbox";
import { Input } from "$lib/components/ui/input";
import { Label } from "$lib/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
import BarChart from "@lucide/svelte/icons/bar-chart";
import Code from "@lucide/svelte/icons/code";
import Eye from "@lucide/svelte/icons/eye";
import EyeOff from "@lucide/svelte/icons/eye-off";
import User from "@lucide/svelte/icons/user";
import LogoIcon from "./logo-icon.svelte";

var root = $.from_html(`<!> <div class="flex flex-col items-center space-y-0.5"><h2 class="text-2xl font-semibold text-foreground">Create an account</h2> <p class="text-muted-foreground">Welcome! Create an account to get started.</p></div>`, 1);
var root_1 = $.from_html(`<span>Select role</span>`);
var root_2 = $.from_html(`<!> <span class="truncate">Product Designer</span>`, 1);
var root_3 = $.from_html(`<!> <span class="truncate">Developer</span>`, 1);
var root_4 = $.from_html(`<!> <span class="truncate">Product Manager</span>`, 1);
var root_5 = $.from_html(`<!> <!> <!>`, 1);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<div class="space-y-2"><!> <!></div> <div class="grid grid-cols-2 gap-4"><div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <!></div> <div class="space-y-2"><!> <div class="relative"><!> <!></div></div> <div class="flex items-center space-x-2"><!> <label for="terms" class="text-sm text-muted-foreground"> <a href="/" class="text-primary hover:underline">Terms</a> <a href="/" class="text-primary hover:underline">Conditions</a></label></div> <!>`, 1);
var root_8 = $.from_html(`<p class="text-center text-sm text-muted-foreground"> <a href="/" class="text-primary hover:underline">Sign in</a></p>`);
var root_9 = $.from_html(`<div class="flex min-h-screen items-center justify-center"><div class="w-full max-w-md"><!></div></div>`);

export default function Login_09($$anchor) {
	let showPassword = $.state(false);
	var div = root_9();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Card(node, {
		class: 'border-none pb-0 shadow-lg',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_5();
			var node_1 = $.first_child(fragment);

			CardHeader(node_1, {
				class: 'flex flex-col items-center space-y-1.5 pt-6 pb-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root();
					var node_2 = $.first_child(fragment_1);

					LogoIcon(node_2, { class: 'h-12 w-12' });
					$.next(2);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_1, 2);

			CardContent(node_3, {
				class: 'space-y-6 px-8',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_7();
					var div_2 = $.first_child(fragment_2);
					var node_4 = $.child(div_2);

					Label(node_4, {
						for: 'role',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Role');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Select(node_5, {
						value: 'designer',
						type: 'single',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_6();
							var node_6 = $.first_child(fragment_3);

							SelectTrigger(node_6, {
								id: 'role',
								class: '[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0',
								children: ($$anchor, $$slotProps) => {
									var span = root_1();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_6, 2);

							SelectContent(node_7, {
								class: '[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]>span>svg]:shrink-0',
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_5();
									var node_8 = $.first_child(fragment_4);

									SelectItem(node_8, {
										value: 'designer',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = root_2();
											var node_9 = $.first_child(fragment_5);

											User(node_9, { size: 16, 'aria-hidden': 'true' });
											$.next(2);
											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_8, 2);

									SelectItem(node_10, {
										value: 'developer',
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root_3();
											var node_11 = $.first_child(fragment_6);

											Code(node_11, { size: 16, 'aria-hidden': 'true' });
											$.next(2);
											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});

									var node_12 = $.sibling(node_10, 2);

									SelectItem(node_12, {
										value: 'manager',
										children: ($$anchor, $$slotProps) => {
											var fragment_7 = root_4();
											var node_13 = $.first_child(fragment_7);

											BarChart(node_13, { size: 16, 'aria-hidden': 'true' });
											$.next(2);
											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_2);

					var div_3 = $.sibling(div_2, 2);
					var div_4 = $.child(div_3);
					var node_14 = $.child(div_4);

					Label(node_14, {
						for: 'firstName',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('First name');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Input(node_15, { id: 'firstName' });
					$.reset(div_4);

					var div_5 = $.sibling(div_4, 2);
					var node_16 = $.child(div_5);

					Label(node_16, {
						for: 'lastName',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Last name');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Input(node_17, { id: 'lastName' });
					$.reset(div_5);
					$.reset(div_3);

					var div_6 = $.sibling(div_3, 2);
					var node_18 = $.child(div_6);

					Label(node_18, {
						for: 'username',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Username');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Input(node_19, { id: 'username' });
					$.reset(div_6);

					var div_7 = $.sibling(div_6, 2);
					var node_20 = $.child(div_7);

					Label(node_20, {
						for: 'email',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Email address');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);

					Input(node_21, { id: 'email', type: 'email' });
					$.reset(div_7);

					var div_8 = $.sibling(div_7, 2);
					var node_22 = $.child(div_8);

					Label(node_22, {
						for: 'password',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Password');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var div_9 = $.sibling(node_22, 2);
					var node_23 = $.child(div_9);

					{
						let $0 = $.derived(() => $.get(showPassword) ? "text" : "password");

						Input(node_23, {
							id: 'password',
							get type() {
								return $.get($0);
							},
							class: 'pr-10'
						});
					}

					var node_24 = $.sibling(node_23, 2);

					Button(node_24, {
						type: 'button',
						variant: 'ghost',
						size: 'icon',
						class: 'absolute top-0 right-0 h-full px-3 text-muted-foreground hover:bg-transparent',
						onclick: () => $.set(showPassword, !$.get(showPassword)),
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_25 = $.first_child(fragment_8);

							{
								var consequent = ($$anchor) => {
									EyeOff($$anchor, { class: 'h-4 w-4' });
								};

								var alternate = ($$anchor) => {
									Eye($$anchor, { class: 'h-4 w-4' });
								};

								$.if(node_25, ($$render) => {
									if ($.get(showPassword)) $$render(consequent); else $$render(alternate, -1);
								});
							}

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});

					$.reset(div_9);
					$.reset(div_8);

					var div_10 = $.sibling(div_8, 2);
					var node_26 = $.child(div_10);

					Checkbox(node_26, { id: 'terms' });

					var label = $.sibling(node_26, 2);
					var text_6 = $.child(label);

					text_6.nodeValue = 'I agree to the  ';

					var text_7 = $.sibling(text_6, 2);

					text_7.nodeValue = ' \n						and  ';
					$.next();
					$.reset(label);
					$.reset(div_10);

					var node_27 = $.sibling(div_10, 2);

					Button(node_27, {
						class: 'w-full bg-primary text-primary-foreground',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Create free account');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_28 = $.sibling(node_3, 2);

			CardFooter(node_28, {
				class: 'flex justify-center border-t py-4!',
				children: ($$anchor, $$slotProps) => {
					var p = root_8();
					var text_9 = $.child(p);

					text_9.nodeValue = 'Already have an account?  ';
					$.next();
					$.reset(p);
					$.append($$anchor, p);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
}