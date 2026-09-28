import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LoadingDots from '$lib/core/components/common/loading-dots.svelte';
import { Button } from '$lib/components/ui/button/index.js';
import { Input } from '$lib/components/ui/input/index.js';
import { PincodeCheckRenderer, useProductState } from '$lib/core/composables/index.js';
import { MapPin } from '@lucide/svelte';

var root = $.from_html(`<div class="flex w-full justify-center"><!></div>`);
var root_1 = $.from_html(`<div class="relative flex gap-2"><!> <!></div>`);
var root_2 = $.from_html(`<span class="mr-2">Check Availability in your area</span> <!>`, 1);
var root_3 = $.from_html(`<p class="mt-1 text-sm font-medium text-green-600 dark:text-green-400"> </p>`);
var root_4 = $.from_html(`<p class="mt-1 text-sm font-medium text-destructive">Sorry, we do not deliver to your area.</p>`);
var root_5 = $.from_html(`<div aria-live="polite" aria-atomic="true" class="min-h-[20px]"><!></div>`);
var root_6 = $.from_html(`<!> <!>`, 1);

export default function Pincode_check($$anchor, $$props) {
	$.push($$props, true);

	let pincode = $.state(void 0);
	const productState = useProductState();

	{
		const content = ($$anchor, $$arg0) => {
			let showPincode = () => ($$arg0?.()).showPincode;
			let loading = () => ($$arg0?.()).loading;
			let hasSingleWarehouse = () => ($$arg0?.()).hasSingleWarehouse;
			let selectedWarehouse = () => ($$arg0?.()).selectedWarehouse;
			let resultText = () => ($$arg0?.()).resultText;
			let checkPincode = () => ($$arg0?.()).checkPincode;
			let toggleShowPincode = () => ($$arg0?.()).toggleShowPincode;
			var fragment_1 = root_6();
			var node = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var node_1 = $.child(div);

					LoadingDots(node_1, {});
					$.reset(div);
					$.append($$anchor, div);
				};

				var consequent_3 = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					{
						var consequent_2 = ($$anchor) => {
							var div_1 = root_1();
							var node_3 = $.child(div_1);

							Input(node_3, {
								type: 'number',
								class: 'w-full rounded-md border-input bg-background p-2 [appearance:textfield] placeholder:text-muted-foreground/80 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
								placeholder: 'Enter Pincode',
								'aria-label': 'Enter Pincode',
								get value() {
									return $.get(pincode);
								},

								set value($$value) {
									$.set(pincode, $$value, true);
								}
							});

							var node_4 = $.sibling(node_3, 2);

							{
								let $0 = $.derived(() => !($.get(pincode) && $.get(pincode) > 0) || loading());

								Button(node_4, {
									get disabled() {
										return $.get($0);
									},

									get onclick() {
										return checkPincode();
									},
									class: 'min-w-[80px]',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										{
											var consequent_1 = ($$anchor) => {
												LoadingDots($$anchor, {});
											};

											var alternate = ($$anchor) => {
												var text = $.text('Check');

												$.append($$anchor, text);
											};

											$.if(node_5, ($$render) => {
												if (loading()) $$render(consequent_1); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_1);
							$.append($$anchor, div_1);
						};

						var alternate_1 = ($$anchor) => {
							Button($$anchor, {
								variant: 'plain',
								get onclick() {
									return toggleShowPincode();
								},
								class: 'flex min-h-[44px] items-center justify-start p-0 font-medium hover:bg-transparent',
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_2();
									var node_6 = $.sibling($.first_child(fragment_6), 2);

									MapPin(node_6, { class: 'size-4 text-primary' });
									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						};

						$.if(node_2, ($$render) => {
							if (!showPincode()) $$render(consequent_2); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_2);
				};

				$.if(node, ($$render) => {
					if (!productState.warehouseLoaded) $$render(consequent); else if (!hasSingleWarehouse()) $$render(consequent_3, 1);
				});
			}

			var node_7 = $.sibling(node, 2);

			{
				var consequent_5 = ($$anchor) => {
					var div_2 = root_5();
					var node_8 = $.child(div_2);

					{
						var consequent_4 = ($$anchor) => {
							var p = root_3();
							var text_1 = $.only_child(p);

							$.template_effect(() => $.set_text(text_1, `Available in your area. Ships in ${selectedWarehouse().leadTime ?? ''} business days`));
							$.append($$anchor, p);
						};

						var alternate_2 = ($$anchor) => {
							var p_1 = root_4();

							$.append($$anchor, p_1);
						};

						$.if(node_8, ($$render) => {
							if (selectedWarehouse()) $$render(consequent_4); else $$render(alternate_2, -1);
						});
					}

					$.reset(div_2);
					$.append($$anchor, div_2);
				};

				$.if(node_7, ($$render) => {
					if (resultText()) $$render(consequent_5);
				});
			}

			$.append($$anchor, fragment_1);
		};

		PincodeCheckRenderer($$anchor, {
			get pincode() {
				return $.get(pincode);
			},

			set pincode($$value) {
				$.set(pincode, $$value, true);
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}