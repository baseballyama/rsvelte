import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as InputGroup from "$lib/components/ui/input-group/index.js";
import Plus from "@lucide/svelte/icons/plus";
import X from "@lucide/svelte/icons/x";
import { AllRecordTypes } from "$lib/clientTools";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`Host <span class="text-destructive">*</span>`, 1);
var root_2 = $.from_html(`<span class="text-destructive">*</span>`);
var root_3 = $.from_html(`Name Server <!>`, 1);
var root_4 = $.from_html(`<p class="text-muted-foreground text-xs">DoT resolver address. For IP resolvers, set TLS Server Name when required (e.g. 8.8.8.8 → dns.google).</p>`);
var root_5 = $.from_html(`<p class="text-muted-foreground text-xs">Leave blank to use authoritative DNS nameservers automatically.</p>`);
var root_6 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div>`);
var root_7 = $.from_html(`<div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!> <p class="text-muted-foreground text-xs">SNI hostname for TLS. Required for many public resolvers when using an IP address.</p></div> <div class="flex items-center gap-3 pt-6"><!> <!></div></div>`);
var root_8 = $.from_html(`Expected Values <span class="text-destructive">*</span>`, 1);
var root_9 = $.from_html(`<!> `, 1);
var root_10 = $.from_html(`<!> <!> <!>`, 1);
var root_11 = $.from_html(`<div class="space-y-2"></div>`);
var root_12 = $.from_html(`<p class="text-muted-foreground text-sm">No values added. Click "Add Value" to add expected DNS response values.</p>`);
var root_13 = $.from_html(`<div class="space-y-4"><div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!> <!></div> <!></div> <!> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-2"><!> <!></div> <div class="flex flex-col gap-2"><!> <!></div></div> <div><div class="mb-2 flex items-center justify-between"><!> <!></div> <!></div></div>`);

export default function Monitor_dns($$anchor, $$props) {
	$.push($$props, true);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let data = $.prop($$props, 'data', 15);

	// Initialize defaults if not set
	if (!data().host) data(data().host = "", true);

	if (!data().nameServer) data(data().nameServer = "", true);
	if (!data().lookupRecord) data(data().lookupRecord = "A", true);
	if (!data().matchType) data(data().matchType = "ANY", true);
	if (!data().transport) data(data().transport = "UDP", true);
	if (!data().tlsPort) data(data().tlsPort = 853, true);
	if (!data().tlsServername) data(data().tlsServername = "", true);
	if (data().allowSelfSignedCert === undefined) data(data().allowSelfSignedCert = false, true);
	if (!data().values) data(data().values = [""], true);

	const recordTypes = Object.keys(AllRecordTypes);
	const usesTls = $.derived(() => data().transport === "TLS");

	function addValue() {
		data(data().values = [...data().values, ""], true);
	}

	function removeValue(index) {
		data(data().values = data().values.filter((_, i) => i !== index), true);
	}

	var div = root_13();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		for: 'dns-transport',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Transport');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return data().transport;
			},

			onValueChange: (v) => {
				if (v) data(data().transport = v, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_2 = $.first_child(fragment);

				$.component(node_2, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						id: 'dns-transport',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, data().transport === "TLS" ? "DNS-over-TLS" : "UDP"));
							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				});

				var node_3 = $.sibling(node_2, 2);

				$.component(node_3, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_4 = $.first_child(fragment_2);

							$.component(node_4, () => Select.Item, ($$anchor, Select_Item) => {
								Select_Item($$anchor, {
									value: 'UDP',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('UDP - Standard DNS (port 53)');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Select.Item, ($$anchor, Select_Item_1) => {
								Select_Item_1($$anchor, {
									value: 'TLS',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('TLS - DNS-over-TLS (port 853)');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
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
		for: 'dns-host',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_3 = root_1();

			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Input(node_7, {
		id: 'dns-host',
		placeholder: 'example.com',
		get value() {
			return data().host;
		},

		set value($$value) {
			data(data().host = $$value, true);
		}
	});

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.child(div_4);
	var node_8 = $.child(div_5);

	Label(node_8, {
		for: 'dns-nameserver',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_4 = root_3();
			var node_9 = $.sibling($.first_child(fragment_4));

			{
				var consequent = ($$anchor) => {
					var span = root_2();

					$.append($$anchor, span);
				};

				var alternate = ($$anchor) => {
					var text_4 = $.text('(optional)');

					$.append($$anchor, text_4);
				};

				$.if(node_9, ($$render) => {
					if ($.get(usesTls)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => $.get(usesTls)
			? "1.1.1.1 or dns.example.com"
			: "Leave empty for authoritative lookup");

		Input(node_10, {
			id: 'dns-nameserver',
			get placeholder() {
				return $.get($0);
			},

			get value() {
				return data().nameServer;
			},

			set value($$value) {
				data(data().nameServer = $$value, true);
			}
		});
	}

	var node_11 = $.sibling(node_10, 2);

	{
		var consequent_1 = ($$anchor) => {
			var p = root_4();

			$.append($$anchor, p);
		};

		var alternate_1 = ($$anchor) => {
			var p_1 = root_5();

			$.append($$anchor, p_1);
		};

		$.if(node_11, ($$render) => {
			if ($.get(usesTls)) $$render(consequent_1); else $$render(alternate_1, -1);
		});
	}

	$.reset(div_5);

	var node_12 = $.sibling(div_5, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_6 = root_6();
			var node_13 = $.child(div_6);

			Label(node_13, {
				for: 'dns-tls-port',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('TLS Port');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			Input(node_14, {
				id: 'dns-tls-port',
				type: 'number',
				min: '1',
				max: '65535',
				placeholder: '853',
				get value() {
					return data().tlsPort;
				},

				set value($$value) {
					data(data().tlsPort = $$value, true);
				}
			});

			$.reset(div_6);
			$.append($$anchor, div_6);
		};

		$.if(node_12, ($$render) => {
			if ($.get(usesTls)) $$render(consequent_2);
		});
	}

	$.reset(div_4);

	var node_15 = $.sibling(div_4, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_7 = root_7();
			var div_8 = $.child(div_7);
			var node_16 = $.child(div_8);

			Label(node_16, {
				for: 'dns-tls-servername',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('TLS Server Name (optional)');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_17 = $.sibling(node_16, 2);

			Input(node_17, {
				id: 'dns-tls-servername',
				placeholder: 'dns.google',
				get value() {
					return data().tlsServername;
				},

				set value($$value) {
					data(data().tlsServername = $$value, true);
				}
			});

			$.next(2);
			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var node_18 = $.child(div_9);

			Switch(node_18, {
				id: 'dns-self-signed',
				get checked() {
					return data().allowSelfSignedCert;
				},

				set checked($$value) {
					data(data().allowSelfSignedCert = $$value, true);
				}
			});

			var node_19 = $.sibling(node_18, 2);

			Label(node_19, {
				for: 'dns-self-signed',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Allow self-signed TLS certificates');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		$.if(node_15, ($$render) => {
			if ($.get(usesTls)) $$render(consequent_3);
		});
	}

	var div_10 = $.sibling(node_15, 2);
	var div_11 = $.child(div_10);
	var node_20 = $.child(div_11);

	Label(node_20, {
		for: 'dns-record',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Lookup Record');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_21 = $.sibling(node_20, 2);

	$.component(node_21, () => Select.Root, ($$anchor, Select_Root_1) => {
		Select_Root_1($$anchor, {
			type: 'single',
			get value() {
				return data().lookupRecord;
			},

			onValueChange: (v) => {
				if (v) data(data().lookupRecord = v, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root();
				var node_22 = $.first_child(fragment_5);

				$.component(node_22, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
					Select_Trigger_1($$anchor, {
						id: 'dns-record',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text();

							$.template_effect(() => $.set_text(text_9, data().lookupRecord));
							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});
				});

				var node_23 = $.sibling(node_22, 2);

				$.component(node_23, () => Select.Content, ($$anchor, Select_Content_1) => {
					Select_Content_1($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_7 = $.comment();
							var node_24 = $.first_child(fragment_7);

							$.each(node_24, 17, () => recordTypes, $.index, ($$anchor, recordType) => {
								var fragment_8 = $.comment();
								var node_25 = $.first_child(fragment_8);

								$.component(node_25, () => Select.Item, ($$anchor, Select_Item_2) => {
									Select_Item_2($$anchor, {
										get value() {
											return $.get(recordType);
										},

										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_10 = $.text();

											$.template_effect(() => $.set_text(text_10, $.get(recordType)));
											$.append($$anchor, text_10);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_8);
							});

							$.append($$anchor, fragment_7);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_11);

	var div_12 = $.sibling(div_11, 2);
	var node_26 = $.child(div_12);

	Label(node_26, {
		for: 'dns-matchtype',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Match Type');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_27 = $.sibling(node_26, 2);

	$.component(node_27, () => Select.Root, ($$anchor, Select_Root_2) => {
		Select_Root_2($$anchor, {
			type: 'single',
			get value() {
				return data().matchType;
			},

			onValueChange: (v) => {
				if (v) data(data().matchType = v, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_10 = root();
				var node_28 = $.first_child(fragment_10);

				$.component(node_28, () => Select.Trigger, ($$anchor, Select_Trigger_2) => {
					Select_Trigger_2($$anchor, {
						id: 'dns-matchtype',
						class: 'w-full',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text();

							$.template_effect(() => $.set_text(text_12, data().matchType));
							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});
				});

				var node_29 = $.sibling(node_28, 2);

				$.component(node_29, () => Select.Content, ($$anchor, Select_Content_2) => {
					Select_Content_2($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_12 = root();
							var node_30 = $.first_child(fragment_12);

							$.component(node_30, () => Select.Item, ($$anchor, Select_Item_3) => {
								Select_Item_3($$anchor, {
									value: 'ANY',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_13 = $.text('ANY - At least one value matches');

										$.append($$anchor, text_13);
									},
									$$slots: { default: true }
								});
							});

							var node_31 = $.sibling(node_30, 2);

							$.component(node_31, () => Select.Item, ($$anchor, Select_Item_4) => {
								Select_Item_4($$anchor, {
									value: 'ALL',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_14 = $.text('ALL - All values must match');

										$.append($$anchor, text_14);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_12);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_10);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_12);
	$.reset(div_10);

	var div_13 = $.sibling(div_10, 2);
	var div_14 = $.child(div_13);
	var node_32 = $.child(div_14);

	Label(node_32, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_13 = root_8();

			$.next();
			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	var node_33 = $.sibling(node_32, 2);

	Button(node_33, {
		variant: 'outline',
		size: 'sm',
		onclick: addValue,
		children: ($$anchor, $$slotProps) => {
			var fragment_14 = root_9();
			var node_34 = $.first_child(fragment_14);

			Plus(node_34, { class: 'mr-1 size-4' });

			var text_15 = $.sibling(node_34);

			$.template_effect(() => $.set_text(text_15, ` ${data().values.length > 0 ? "Add More Values" : "Add Value"}`));
			$.append($$anchor, fragment_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_14);

	var node_35 = $.sibling(div_14, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_15 = root_11();

			$.each(div_15, 21, () => data().values, $.index, ($$anchor, value, index) => {
				var fragment_15 = $.comment();
				var node_36 = $.first_child(fragment_15);

				$.component(node_36, () => InputGroup.Root, ($$anchor, InputGroup_Root) => {
					InputGroup_Root($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_16 = root_10();
							var node_37 = $.first_child(fragment_16);

							$.component(node_37, () => InputGroup.Addon, ($$anchor, InputGroup_Addon) => {
								InputGroup_Addon($$anchor, {
									class: '',
									children: ($$anchor, $$slotProps) => {
										var fragment_17 = $.comment();
										var node_38 = $.first_child(fragment_17);

										$.component(node_38, () => InputGroup.Text, ($$anchor, InputGroup_Text) => {
											InputGroup_Text($$anchor, {
												class: 'border-r-2 pr-2',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text();

													text_16.nodeValue = `Value ${index + 1}`;
													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_17);
									},
									$$slots: { default: true }
								});
							});

							var node_39 = $.sibling(node_37, 2);

							$.component(node_39, () => InputGroup.Input, ($$anchor, InputGroup_Input) => {
								InputGroup_Input($$anchor, {
									placeholder: 'Expected DNS value',
									get value() {
										return data().values[index];
									},

									set value($$value) {
										data(data().values[index] = $$value, true);
									}
								});
							});

							var node_40 = $.sibling(node_39, 2);

							$.component(node_40, () => InputGroup.Addon, ($$anchor, InputGroup_Addon_1) => {
								InputGroup_Addon_1($$anchor, {
									align: 'inline-end',
									children: ($$anchor, $$slotProps) => {
										var fragment_19 = $.comment();
										var node_41 = $.first_child(fragment_19);

										$.component(node_41, () => InputGroup.Button, ($$anchor, InputGroup_Button) => {
											InputGroup_Button($$anchor, {
												variant: 'ghost',
												size: 'icon-xs',
												onclick: () => removeValue(index),
												children: ($$anchor, $$slotProps) => {
													X($$anchor, { class: 'size-4' });
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_19);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_16);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_15);
			});

			$.reset(div_15);
			$.append($$anchor, div_15);
		};

		var alternate_2 = ($$anchor) => {
			var p_2 = root_12();

			$.append($$anchor, p_2);
		};

		$.if(node_35, ($$render) => {
			if (data().values.length > 0) $$render(consequent_4); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_13);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}