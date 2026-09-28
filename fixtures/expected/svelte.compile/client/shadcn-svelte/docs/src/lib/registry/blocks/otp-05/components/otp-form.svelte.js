import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
import * as Field from "$lib/registry/ui/field/index.js";
import * as InputOTP from "$lib/registry/ui/input-otp/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class']);
var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`Didn't receive the code? <a href="#/">Resend</a>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col items-center gap-2 text-center"><a href="#/" class="flex flex-col items-center gap-2 font-medium"><div class="flex size-8 items-center justify-center rounded-md"><!></div> <span class="sr-only">Acme Inc.</span></a> <h1 class="text-xl font-bold">Enter verification code</h1> <!></div> <!> <!>`, 1);
var root_3 = $.from_html(`By clicking continue, you agree to our <a href="#/">Terms of Service</a> and <a href="#/">Privacy Policy</a>.`, 1);
var root_4 = $.from_html(`<div><form><!></form> <!></div>`);

export default function Otp_form($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root_4();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("flex flex-col gap-6", $$props.class)]);

	var form = $.child(div);
	var node = $.child(form);

	$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
		Field_Group($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root_2();
				var div_1 = $.first_child(fragment);
				var a = $.child(div_1);
				var div_2 = $.child(a);
				var node_1 = $.child(div_2);

				GalleryVerticalEndIcon(node_1, { class: 'size-6' });
				$.reset(div_2);
				$.next(2);
				$.reset(a);

				var node_2 = $.sibling(a, 4);

				$.component(node_2, () => Field.Description, ($$anchor, Field_Description) => {
					Field_Description($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('We sent a 6-digit code to your email address');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				$.reset(div_1);

				var node_3 = $.sibling(div_1, 2);

				$.component(node_3, () => Field.Field, ($$anchor, Field_Field) => {
					Field_Field($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_1 = root();
							var node_4 = $.first_child(fragment_1);

							$.component(node_4, () => Field.Label, ($$anchor, Field_Label) => {
								Field_Label($$anchor, {
									for: 'otp',
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Verification code');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							{
								const children = ($$anchor, $$arg0) => {
									let cells = () => ($$arg0?.()).cells;
									var fragment_2 = root();
									var node_6 = $.first_child(fragment_2);

									$.component(node_6, () => InputOTP.Group, ($$anchor, InputOTP_Group) => {
										InputOTP_Group($$anchor, {
											class: 'gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_3 = $.comment();
												var node_7 = $.first_child(fragment_3);

												$.each(node_7, 16, () => cells().slice(0, 3), (cell) => cell, ($$anchor, cell) => {
													var fragment_4 = $.comment();
													var node_8 = $.first_child(fragment_4);

													$.component(node_8, () => InputOTP.Slot, ($$anchor, InputOTP_Slot) => {
														InputOTP_Slot($$anchor, {
															get cell() {
																return cell;
															}
														});
													});

													$.append($$anchor, fragment_4);
												});

												$.append($$anchor, fragment_3);
											},
											$$slots: { default: true }
										});
									});

									var node_9 = $.sibling(node_6, 2);

									$.component(node_9, () => InputOTP.Separator, ($$anchor, InputOTP_Separator) => {
										InputOTP_Separator($$anchor, {});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => InputOTP.Group, ($$anchor, InputOTP_Group_1) => {
										InputOTP_Group_1($$anchor, {
											class: 'gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl',
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = $.comment();
												var node_11 = $.first_child(fragment_5);

												$.each(node_11, 16, () => cells().slice(3, 6), (cell) => cell, ($$anchor, cell) => {
													var fragment_6 = $.comment();
													var node_12 = $.first_child(fragment_6);

													$.component(node_12, () => InputOTP.Slot, ($$anchor, InputOTP_Slot_1) => {
														InputOTP_Slot_1($$anchor, {
															get cell() {
																return cell;
															}
														});
													});

													$.append($$anchor, fragment_6);
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_2);
								};

								$.component(node_5, () => InputOTP.Root, ($$anchor, InputOTP_Root) => {
									InputOTP_Root($$anchor, {
										maxlength: 6,
										id: 'otp',
										required: true,
										class: 'gap-4',
										children,
										$$slots: { default: true }
									});
								});
							}

							var node_13 = $.sibling(node_5, 2);

							$.component(node_13, () => Field.Description, ($$anchor, Field_Description_1) => {
								Field_Description_1($$anchor, {
									class: 'text-center',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var fragment_7 = root_1();

										$.next();
										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_1);
						},
						$$slots: { default: true }
					});
				});

				var node_14 = $.sibling(node_3, 2);

				$.component(node_14, () => Field.Field, ($$anchor, Field_Field_1) => {
					Field_Field_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								type: 'submit',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Verify');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});
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

	var node_15 = $.sibling(form, 2);

	$.component(node_15, () => Field.Description, ($$anchor, Field_Description_2) => {
		Field_Description_2($$anchor, {
			class: 'px-6 text-center',
			children: ($$anchor, $$slotProps) => {
				$.next();

				var fragment_9 = root_3();

				$.next(4);
				$.append($$anchor, fragment_9);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}