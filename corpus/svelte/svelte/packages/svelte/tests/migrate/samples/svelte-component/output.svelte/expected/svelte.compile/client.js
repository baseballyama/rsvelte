import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<div><!></div>`);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<div><p><!></p></div>`);
var root_4 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Output($$anchor, $$props) {
	$.push($$props, true);

	const /** @type {{ [key: string]: any }} */
	test = ($$anchor) => {
		const stuff = $.derived(() => true);
		const SvelteComponent_27 = $.derived(() => $.get(stuff) && Component);
		var li = root();
		var node = $.child(li);

		$.component(node, () => $.get(SvelteComponent_27), ($$anchor, SvelteComponent_27_1) => {
			SvelteComponent_27_1($$anchor, {});
		});

		$.reset(li);
		$.append($$anchor, li);
	};

	let rest = $.rest_props($$props, rest_excludes);
	let Component;
	let fallback;
	const SvelteComponent_10 = $.derived(() => Math.random() > .5 ? $$props.heads : $$props.tail);
	var fragment = root_4();
	var node_1 = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let Comp = () => ($$arg0?.()).Comp;
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, Comp, ($$anchor, Comp_1) => {
				Comp_1($$anchor, {});
			});

			$.append($$anchor, fragment_1);
		};

		Component(node_1, { children, $$slots: { default: true } });
	}

	var node_3 = $.sibling(node_1, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let comp = () => ($$arg0?.()).comp;
			const SvelteComponent = $.derived(comp);
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.component(node_4, () => $.get(SvelteComponent), ($$anchor, SvelteComponent_11) => {
				SvelteComponent_11($$anchor, {});
			});

			$.append($$anchor, fragment_2);
		};

		Component(node_3, { children, $$slots: { default: true } });
	}

	var node_5 = $.sibling(node_3, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_1 = $.derived(stuff);
			var fragment_3 = $.comment();
			var node_6 = $.first_child(fragment_3);

			$.component(node_6, () => $.get(SvelteComponent_1), ($$anchor, SvelteComponent_1_1) => {
				SvelteComponent_1_1($$anchor, {});
			});

			$.append($$anchor, fragment_3);
		};

		Component(node_5, { children, $$slots: { default: true } });
	}

	var node_7 = $.sibling(node_5, 2);

	{
		const x = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_2 = $.derived(stuff);
			var div = root_1();
			var node_8 = $.child(div);

			$.component(node_8, () => $.get(SvelteComponent_2), ($$anchor, SvelteComponent_2_1) => {
				SvelteComponent_2_1($$anchor, {});
			});

			$.reset(div);
			$.append($$anchor, div);
		};

		Component(node_7, { x, $$slots: { x: true } });
	}

	var node_9 = $.sibling(node_7, 2);

	{
		const x = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_3 = $.derived(stuff);
			var fragment_4 = $.comment();
			var node_10 = $.first_child(fragment_4);

			$.component(node_10, () => $.get(SvelteComponent_3), ($$anchor, SvelteComponent_3_1) => {
				SvelteComponent_3_1($$anchor, {});
			});

			$.append($$anchor, fragment_4);
		};

		Component(node_9, { x, $$slots: { x: true } });
	}

	var node_11 = $.sibling(node_9, 2);

	{
		const x = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_4 = $.derived(stuff);
			var fragment_5 = $.comment();
			var node_12 = $.first_child(fragment_5);

			$.element(node_12, () => "div", false, ($$element, $$anchor) => {
				var fragment_6 = $.comment();
				var node_13 = $.first_child(fragment_6);

				$.component(node_13, () => $.get(SvelteComponent_4), ($$anchor, SvelteComponent_4_1) => {
					SvelteComponent_4_1($$anchor, {});
				});

				$.append($$anchor, fragment_6);
			});

			$.append($$anchor, fragment_5);
		};

		Component(node_11, { x, $$slots: { x: true } });
	}

	var node_14 = $.sibling(node_11, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let Comp = () => ($$arg0?.()).Comp;
			var fragment_7 = $.comment();
			var node_15 = $.first_child(fragment_7);

			$.component(node_15, Comp, ($$anchor, Comp_2) => {
				Comp_2($$anchor, {});
			});

			$.append($$anchor, fragment_7);
		};

		Component(node_14, { children, $$slots: { default: true } });
	}

	var node_16 = $.sibling(node_14, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let comp = () => ($$arg0?.()).comp;
			const SvelteComponent_5 = $.derived(comp);
			var fragment_8 = $.comment();
			var node_17 = $.first_child(fragment_8);

			$.component(node_17, () => $.get(SvelteComponent_5), ($$anchor, SvelteComponent_5_1) => {
				SvelteComponent_5_1($$anchor, {});
			});

			$.append($$anchor, fragment_8);
		};

		Component(node_16, { children, $$slots: { default: true } });
	}

	var node_18 = $.sibling(node_16, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_6 = $.derived(stuff);
			var fragment_9 = $.comment();
			var node_19 = $.first_child(fragment_9);

			$.component(node_19, () => $.get(SvelteComponent_6), ($$anchor, SvelteComponent_6_1) => {
				SvelteComponent_6_1($$anchor, {});
			});

			$.append($$anchor, fragment_9);
		};

		Component(node_18, { children, $$slots: { default: true } });
	}

	var node_20 = $.sibling(node_18, 2);

	{
		const x = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_7 = $.derived(stuff);
			var div_1 = root_1();
			var node_21 = $.child(div_1);

			$.component(node_21, () => $.get(SvelteComponent_7), ($$anchor, SvelteComponent_7_1) => {
				SvelteComponent_7_1($$anchor, {});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		Component(node_20, { x, $$slots: { x: true } });
	}

	var node_22 = $.sibling(node_20, 2);

	{
		const x = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_8 = $.derived(stuff);
			var fragment_10 = $.comment();
			var node_23 = $.first_child(fragment_10);

			$.component(node_23, () => $.get(SvelteComponent_8), ($$anchor, SvelteComponent_8_1) => {
				SvelteComponent_8_1($$anchor, {});
			});

			$.append($$anchor, fragment_10);
		};

		Component(node_22, { x, $$slots: { x: true } });
	}

	var node_24 = $.sibling(node_22, 2);

	{
		const x = ($$anchor, $$arg0) => {
			let stuff = () => ($$arg0?.()).comp;
			const SvelteComponent_9 = $.derived(stuff);
			var fragment_11 = $.comment();
			var node_25 = $.first_child(fragment_11);

			$.element(node_25, () => "div", false, ($$element_1, $$anchor) => {
				var fragment_12 = $.comment();
				var node_26 = $.first_child(fragment_12);

				$.component(node_26, () => $.get(SvelteComponent_9), ($$anchor, SvelteComponent_9_1) => {
					SvelteComponent_9_1($$anchor, {});
				});

				$.append($$anchor, fragment_12);
			});

			$.append($$anchor, fragment_11);
		};

		Component(node_24, { x, $$slots: { x: true } });
	}

	var node_27 = $.sibling(node_24, 2);

	Component(node_27, {});

	var node_28 = $.sibling(node_27, 2);

	Component(node_28, {
		prop: true,
		value: '',
		$$events: {
			click: [
				function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				},
				() => ''
			]
		}
	});

	var node_29 = $.sibling(node_28, 2);

	$.component(node_29, () => $.get(SvelteComponent_10), ($$anchor, SvelteComponent_10_1) => {
		SvelteComponent_10_1($$anchor, {
			prop: true,
			value: '',
			$$events: {
				click: [
					function ($$arg) {
						$.bubble_event.call(this, $$props, $$arg);
					},
					() => ''
				]
			}
		});
	});

	var node_30 = $.sibling(node_29, 2);

	Component(node_30, {
		prop: true,
		value: '',
		$$events: {
			click: [
				function ($$arg) {
					$.bubble_event.call(this, $$props, $$arg);
				},
				() => ''
			]
		}
	});

	var node_31 = $.sibling(node_30, 2);

	$.component(node_31, () => $.get(SvelteComponent_10), ($$anchor, SvelteComponent_10_2) => {
		SvelteComponent_10_2($$anchor, {
			prop: true,
			value: '',
			$$events: {
				click: [
					function ($$arg) {
						$.bubble_event.call(this, $$props, $$arg);
					},
					() => ''
				]
			}
		});
	});

	var node_32 = $.sibling(node_31, 2);

	{
		var consequent = ($$anchor) => {
			const x = $.derived(() => ({ Component }));
			const SvelteComponent_12 = $.derived(() => $.get(x)['Component']);
			var fragment_13 = $.comment();
			var node_33 = $.first_child(fragment_13);

			$.component(node_33, () => $.get(SvelteComponent_12), ($$anchor, SvelteComponent_12_1) => {
				SvelteComponent_12_1($$anchor, {});
			});

			$.append($$anchor, fragment_13);
		};

		$.if(node_32, ($$render) => {
			if (true) $$render(consequent);
		});
	}

	var node_34 = $.sibling(node_32, 2);

	{
		var consequent_1 = ($$anchor) => {
			const x = $.derived(() => ({ Component }));
			var fragment_14 = $.comment();
			var node_35 = $.first_child(fragment_14);

			$.component(node_35, () => $.get(x).Component, ($$anchor, x_Component) => {
				x_Component($$anchor, {});
			});

			$.append($$anchor, fragment_14);
		};

		$.if(node_34, ($$render) => {
			if (true) $$render(consequent_1);
		});
	}

	var node_36 = $.sibling(node_34, 2);

	$.each(node_36, 16, () => [], $.index, ($$anchor, component) => {
		const SvelteComponent_13 = $.derived(() => component);
		var fragment_15 = $.comment();
		var node_37 = $.first_child(fragment_15);

		$.component(node_37, () => $.get(SvelteComponent_13), ($$anchor, SvelteComponent_13_1) => {
			SvelteComponent_13_1($$anchor, {});
		});

		$.append($$anchor, fragment_15);
	});

	var node_38 = $.sibling(node_36, 2);

	$.each(node_38, 16, () => [], $.index, ($$anchor, Component, $$index_1, $$array) => {
		var fragment_16 = $.comment();
		var node_39 = $.first_child(fragment_16);

		$.component(node_39, () => Component, ($$anchor, Component_1) => {
			Component_1($$anchor, {});
		});

		$.append($$anchor, fragment_16);
	});

	var node_40 = $.sibling(node_38, 2);

	$.each(node_40, 16, () => [], $.index, ($$anchor, component) => {
		const Comp = $.derived(() => component.component);
		var fragment_17 = $.comment();
		var node_41 = $.first_child(fragment_17);

		$.component(node_41, () => $.get(Comp), ($$anchor, Comp_3) => {
			Comp_3($$anchor, {});
		});

		$.append($$anchor, fragment_17);
	});

	var node_42 = $.sibling(node_40, 2);

	$.each(node_42, 16, () => [], $.index, ($$anchor, component) => {
		const comp = $.derived(() => component.component);
		const SvelteComponent_14 = $.derived(() => $.get(comp));
		var fragment_18 = $.comment();
		var node_43 = $.first_child(fragment_18);

		$.component(node_43, () => $.get(SvelteComponent_14), ($$anchor, SvelteComponent_14_1) => {
			SvelteComponent_14_1($$anchor, {});
		});

		$.append($$anchor, fragment_18);
	});

	var node_44 = $.sibling(node_42, 2);

	$.await(
		node_44,
		() => Promise.resolve(),
		($$anchor) => {
			const SvelteComponent_15 = $.derived(() => fallback);
			var fragment_21 = root_2();
			var node_47 = $.first_child(fragment_21);

			Component(node_47, {});

			var node_48 = $.sibling(node_47, 2);

			$.component(node_48, () => $.get(SvelteComponent_15), ($$anchor, SvelteComponent_15_1) => {
				SvelteComponent_15_1($$anchor, {});
			});

			$.append($$anchor, fragment_21);
		},
		($$anchor, something) => {
			const SvelteComponent_16 = $.derived(() => $.get(something));
			var fragment_19 = $.comment();
			var node_45 = $.first_child(fragment_19);

			$.component(node_45, () => $.get(SvelteComponent_16), ($$anchor, SvelteComponent_16_1) => {
				SvelteComponent_16_1($$anchor, {});
			});

			$.append($$anchor, fragment_19);
		},
		($$anchor, e) => {
			const SvelteComponent_17 = $.derived(() => $.get(e));
			var fragment_20 = $.comment();
			var node_46 = $.first_child(fragment_20);

			$.component(node_46, () => $.get(SvelteComponent_17), ($$anchor, SvelteComponent_17_1) => {
				SvelteComponent_17_1($$anchor, {});
			});

			$.append($$anchor, fragment_20);
		}
	);

	var node_49 = $.sibling(node_44, 2);

	$.await(
		node_49,
		() => Promise.resolve(),
		null,
		($$anchor, Something) => {
			var fragment_22 = $.comment();
			var node_50 = $.first_child(fragment_22);

			$.component(node_50, () => $.get(Something), ($$anchor, Something_1) => {
				Something_1($$anchor, {});
			});

			$.append($$anchor, fragment_22);
		},
		($$anchor, Error) => {
			var fragment_23 = $.comment();
			var node_51 = $.first_child(fragment_23);

			$.component(node_51, () => $.get(Error), ($$anchor, Error_1) => {
				Error_1($$anchor, {});
			});

			$.append($$anchor, fragment_23);
		}
	);

	var node_52 = $.sibling(node_49, 2);

	Component(node_52, {
		children: ($$anchor, $$slotProps) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_18 = $.derived(() => $.get(stuff) && Component);
			var div_2 = root_3();
			var p = $.child(div_2);
			var node_53 = $.child(p);

			$.component(node_53, () => $.get(SvelteComponent_18), ($$anchor, SvelteComponent_18_1) => {
				SvelteComponent_18_1($$anchor, {});
			});

			$.reset(p);
			$.reset(div_2);
			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_54 = $.sibling(node_52, 2);

	Component(node_54, {
		children: ($$anchor, $$slotProps) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_19 = $.derived(() => $.get(stuff) && Component);
			var div_3 = root_3();
			var p_1 = $.child(div_3);
			var node_55 = $.child(p_1);

			$.component(node_55, () => $.get(SvelteComponent_19), ($$anchor, SvelteComponent_19_1) => {
				SvelteComponent_19_1($$anchor, {});
			});

			$.reset(p_1);
			$.reset(div_3);
			$.append($$anchor, div_3);
		},
		$$slots: { default: true }
	});

	var node_56 = $.sibling(node_54, 2);

	$.each(node_56, 16, () => [], $.index, ($$anchor, i) => {
		const stuff = $.derived(() => true);
		const SvelteComponent_20 = $.derived(() => $.get(stuff) && Component);
		var li_1 = root();
		var node_57 = $.child(li_1);

		$.component(node_57, () => $.get(SvelteComponent_20), ($$anchor, SvelteComponent_20_1) => {
			SvelteComponent_20_1($$anchor, {});
		});

		$.reset(li_1);
		$.append($$anchor, li_1);
	});

	var node_58 = $.sibling(node_56, 2);

	$.await(
		node_58,
		() => stuff,
		($$anchor) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_21 = $.derived(() => $.get(stuff) && Component);
			var li_4 = root();
			var node_61 = $.child(li_4);

			$.component(node_61, () => $.get(SvelteComponent_21), ($$anchor, SvelteComponent_21_1) => {
				SvelteComponent_21_1($$anchor, {});
			});

			$.reset(li_4);
			$.append($$anchor, li_4);
		},
		($$anchor, x) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_22 = $.derived(() => $.get(stuff) && Component);
			var li_2 = root();
			var node_59 = $.child(li_2);

			$.component(node_59, () => $.get(SvelteComponent_22), ($$anchor, SvelteComponent_22_1) => {
				SvelteComponent_22_1($$anchor, {});
			});

			$.reset(li_2);
			$.append($$anchor, li_2);
		},
		($$anchor, e) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_23 = $.derived(() => $.get(stuff) && Component);
			var li_3 = root();
			var node_60 = $.child(li_3);

			$.component(node_60, () => $.get(SvelteComponent_23), ($$anchor, SvelteComponent_23_1) => {
				SvelteComponent_23_1($$anchor, {});
			});

			$.reset(li_3);
			$.append($$anchor, li_3);
		}
	);

	var node_62 = $.sibling(node_58, 2);

	$.await(
		node_62,
		() => stuff,
		null,
		($$anchor, x) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_24 = $.derived(() => $.get(stuff) && Component);
			var li_5 = root();
			var node_63 = $.child(li_5);

			$.component(node_63, () => $.get(SvelteComponent_24), ($$anchor, SvelteComponent_24_1) => {
				SvelteComponent_24_1($$anchor, {});
			});

			$.reset(li_5);
			$.append($$anchor, li_5);
		},
		($$anchor, e) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_25 = $.derived(() => $.get(stuff) && Component);
			var li_6 = root();
			var node_64 = $.child(li_6);

			$.component(node_64, () => $.get(SvelteComponent_25), ($$anchor, SvelteComponent_25_1) => {
				SvelteComponent_25_1($$anchor, {});
			});

			$.reset(li_6);
			$.append($$anchor, li_6);
		}
	);

	var node_65 = $.sibling(node_62, 2);

	{
		var consequent_2 = ($$anchor) => {
			const stuff = $.derived(() => true);
			const SvelteComponent_26 = $.derived(() => $.get(stuff) && Component);
			var li_7 = root();
			var node_66 = $.child(li_7);

			$.component(node_66, () => $.get(SvelteComponent_26), ($$anchor, SvelteComponent_26_1) => {
				SvelteComponent_26_1($$anchor, {});
			});

			$.reset(li_7);
			$.append($$anchor, li_7);
		};

		$.if(node_65, ($$render) => {
			if (true) $$render(consequent_2);
		});
	}

	var node_67 = $.sibling(node_65, 2);

	Component(node_67, {
		children: ($$anchor, $$slotProps) => {
			Nested($$anchor, {
				children: ($$anchor, $$slotProps) => {
					const SvelteComponent_28 = $.derived(() => stuff && Component);
					var fragment_25 = $.comment();
					var node_68 = $.first_child(fragment_25);

					$.component(node_68, () => $.get(SvelteComponent_28), ($$anchor, SvelteComponent_28_1) => {
						SvelteComponent_28_1($$anchor, {});
					});

					$.append($$anchor, fragment_25);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}