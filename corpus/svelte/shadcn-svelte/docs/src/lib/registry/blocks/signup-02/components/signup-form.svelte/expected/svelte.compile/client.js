import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"></path></svg> Sign up with GitHub`, 1);
var root_3 = $.from_html(`Already have an account? <a href="#/">Sign in</a>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col items-center gap-1 text-center"><h1 class="text-2xl font-bold">Create your account</h1> <p class="text-sm text-balance text-muted-foreground">Fill in the form below to create your account</p></div> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_5 = $.from_html(`<form><!></form>`);

export default function Signup_form($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var form = root_5();

	$.attribute_effect(form, ($0) => ({ class: $0, ...restProps }), [() => cn("flex flex-col gap-6", $$props.class)]);

	var node = $.child(form);

	$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
		Field_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_4();
				var node_1 = $.sibling($.first_child(fragment), 2);

				$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
					Field_Field($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_2 = $.first_child(fragment_1);

							$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
								Field_Label($$anchor, {
									for: 'name',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Full Name');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							Input(node_3, {
								id: 'name',
								type: 'text',
								placeholder: 'John Doe',
								required: true
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
					Field_Field_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_5 = $.first_child(fragment_2);

							$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
								Field_Label_1($$anchor, {
									for: 'email',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Email');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_5, 2);

							Input(node_6, {
								id: 'email',
								type: 'email',
								placeholder: 'm@example.com',
								required: true
							});

							var node_7 = $.sibling(node_6, 2);

							$.component(node_7, () => Field.Description, ($$anchor, Field_Description) => {
								Field_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('We\'ll use this to contact you. We will not share your email with anyone else.');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_8 = $.sibling(node_4, 2);

				$.component(node_8, () => Field.Field, ($$anchor, Field_Field_2) => {
					Field_Field_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_9 = $.first_child(fragment_3);

							$.component(node_9, () => Field.Label, ($$anchor, Field_Label_2) => {
								Field_Label_2($$anchor, {
									for: 'password',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Password');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							var node_10 = $.sibling(node_9, 2);

							Input(node_10, { id: 'password', type: 'password', required: true });

							var node_11 = $.sibling(node_10, 2);

							$.component(node_11, () => Field.Description, ($$anchor, Field_Description_1) => {
								Field_Description_1($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_4 = $.text('Must be at least 8 characters long.');

										$.append($$anchor, text_4);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_12 = $.sibling(node_8, 2);

				$.component(node_12, () => Field.Field, ($$anchor, Field_Field_3) => {
					Field_Field_3($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_4 = root_1();
							var node_13 = $.first_child(fragment_4);

							$.component(node_13, () => Field.Label, ($$anchor, Field_Label_3) => {
								Field_Label_3($$anchor, {
									for: 'confirm-password',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_5 = $.text('Confirm Password');

										$.append($$anchor, text_5);
									},
									$$slots: { default: true }
								});
							});

							var node_14 = $.sibling(node_13, 2);

							Input(node_14, { id: 'confirm-password', type: 'password', required: true });

							var node_15 = $.sibling(node_14, 2);

							$.component(node_15, () => Field.Description, ($$anchor, Field_Description_2) => {
								Field_Description_2($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_6 = $.text('Please confirm your password.');

										$.append($$anchor, text_6);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});

				var node_16 = $.sibling(node_12, 2);

				$.component(node_16, () => Field.Field, ($$anchor, Field_Field_4) => {
					Field_Field_4($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								type: 'submit',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Create Account');

									$.append($$anchor, text_7);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				});

				var node_17 = $.sibling(node_16, 2);

				$.component(node_17, () => Field.Separator, ($$anchor, Field_Separator) => {
					Field_Separator($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Or continue with');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				});

				var node_18 = $.sibling(node_17, 2);

				$.component(node_18, () => Field.Field, ($$anchor, Field_Field_5) => {
					Field_Field_5($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = root();
							var node_19 = $.first_child(fragment_6);

							Button(node_19, {
								variant: 'outline',
								type: 'button',
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_2();

									$.next();
									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_20 = $.sibling(node_19, 2);

							$.component(node_20, () => Field.Description, ($$anchor, Field_Description_3) => {
								Field_Description_3($$anchor, {
									class: 'px-6 text-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_8 = root_3();

										$.next();
										$.append($$anchor, fragment_8);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(form);
	$.append($$anchor, form);
	$.pop();
}