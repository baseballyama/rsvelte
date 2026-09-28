import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Button, Note } from "$lib/index.js";

import {
	noteAction,
	noteDefault,
	noteSuccess,
	noteError,
	noteWarning,
	noteViolet,
	noteCyan,
	noteSecondary
} from "../../docs/data/note.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const note = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div);
	$.append($$anchor, div);
};

const defaultNote = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/note#default',
				'aria-label': 'default',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('default');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 2);

			{
				const demo = ($$anchor) => {
					var div_4 = root_2();
					var node_3 = $.child(div_4);

					Note(node_3, {
						size: 'small',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('A small note');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Note(node_4, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('A default note');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Note(node_5, {
						size: 'large',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('A large note');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.reset(div_4);
					$.append($$anchor, div_4);
				};

				var node_6 = $.child(div_3);

				demoAndCode(node_6, () => demo, () => noteDefault);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_4();
	var text_4 = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text_4, rct()));
	$.append($$anchor, code_1);
};

const actionSnip = ($$anchor) => {
	Button($$anchor, {
		size: 'small',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Upgrade');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});
};

const action = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_6();
			var node_7 = $.first_child(fragment_6);

			LinkH2(node_7, {
				href: '/note#action',
				'aria-label': 'action',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('action');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node_7, 2);
			var node_8 = $.sibling($.child(p));

			roundedCode(node_8, () => "action");

			var node_9 = $.sibling(node_8, 2);

			roundedCode(node_9, () => "Snippet");
			$.next();
			$.reset(p);

			var div_5 = $.sibling(p, 2);

			{
				const demo = ($$anchor) => {
					var div_6 = root_5();
					var node_10 = $.child(div_6);

					Note(node_10, {
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('This note details some information.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Note(node_11, {
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('This note details a large amount information that could potentially wrap into two\n						or more lines, forcing the height of the Note to be larger.');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);
					$.append($$anchor, div_6);
				};

				var node_12 = $.child(div_5);

				demoAndCode(node_12, () => demo, () => noteAction);
				$.reset(div_5);
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});
};

const success = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_3();
			var node_13 = $.first_child(fragment_8);

			LinkH2(node_13, {
				href: '/note#success',
				'aria-label': 'success',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('success');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var div_7 = $.sibling(node_13, 2);

			{
				const demo = ($$anchor) => {
					var div_8 = root_8();
					var node_14 = $.child(div_8);

					Note(node_14, {
						type: 'success',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('This note details some success information.');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Note(node_15, {
						type: 'success',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('This note details some success information.');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Note(node_16, {
						type: 'success',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_9 = root_7();

							$.next(2);
							$.append($$anchor, fragment_9);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Note(node_17, {
						fill: true,
						type: 'success',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('This note details some success information.');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Note(node_18, {
						fill: true,
						type: 'success',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('This note details some success information.');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Note(node_19, {
						fill: true,
						type: 'success',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_10 = root_7();

							$.next(2);
							$.append($$anchor, fragment_10);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				var node_20 = $.child(div_7);

				demoAndCode(node_20, () => demo, () => noteSuccess);
				$.reset(div_7);
			}

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});
};

const error = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_3();
			var node_21 = $.first_child(fragment_12);

			LinkH2(node_21, {
				href: '/note#error',
				'aria-label': 'error',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('error');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var div_9 = $.sibling(node_21, 2);

			{
				const demo = ($$anchor) => {
					var div_10 = root_8();
					var node_22 = $.child(div_10);

					Note(node_22, {
						type: 'error',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('This note details some error information.');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					Note(node_23, {
						type: 'error',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('This note details some error information.');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					var node_24 = $.sibling(node_23, 2);

					Note(node_24, {
						type: 'error',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_13 = root_7();

							$.next(2);
							$.append($$anchor, fragment_13);
						},
						$$slots: { default: true }
					});

					var node_25 = $.sibling(node_24, 2);

					Note(node_25, {
						fill: true,
						type: 'error',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('This note details some error information.');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_26 = $.sibling(node_25, 2);

					Note(node_26, {
						fill: true,
						type: 'error',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('This note details some error information.');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					var node_27 = $.sibling(node_26, 2);

					Note(node_27, {
						fill: true,
						type: 'error',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_14 = root_7();

							$.next(2);
							$.append($$anchor, fragment_14);
						},
						$$slots: { default: true }
					});

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				var node_28 = $.child(div_9);

				demoAndCode(node_28, () => demo, () => noteError);
				$.reset(div_9);
			}

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});
};

const warning = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_16 = root_3();
			var node_29 = $.first_child(fragment_16);

			LinkH2(node_29, {
				href: '/note#warning',
				'aria-label': 'warning',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_19 = $.text('warning');

					$.append($$anchor, text_19);
				},
				$$slots: { default: true }
			});

			var div_11 = $.sibling(node_29, 2);

			{
				const demo = ($$anchor) => {
					var div_12 = root_8();
					var node_30 = $.child(div_12);

					Note(node_30, {
						type: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('This note details some warning information.');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					Note(node_31, {
						type: 'warning',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('This note details some warning information.');

							$.append($$anchor, text_21);
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					Note(node_32, {
						type: 'warning',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_17 = root_7();

							$.next(2);
							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});

					var node_33 = $.sibling(node_32, 2);

					Note(node_33, {
						fill: true,
						type: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_22 = $.text('This note details some warning information.');

							$.append($$anchor, text_22);
						},
						$$slots: { default: true }
					});

					var node_34 = $.sibling(node_33, 2);

					Note(node_34, {
						fill: true,
						type: 'warning',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_23 = $.text('This note details some warning information.');

							$.append($$anchor, text_23);
						},
						$$slots: { default: true }
					});

					var node_35 = $.sibling(node_34, 2);

					Note(node_35, {
						fill: true,
						type: 'warning',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_18 = root_7();

							$.next(2);
							$.append($$anchor, fragment_18);
						},
						$$slots: { default: true }
					});

					$.reset(div_12);
					$.append($$anchor, div_12);
				};

				var node_36 = $.child(div_11);

				demoAndCode(node_36, () => demo, () => noteWarning);
				$.reset(div_11);
			}

			$.append($$anchor, fragment_16);
		},
		$$slots: { default: true }
	});
};

const secondary = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_20 = root_3();
			var node_37 = $.first_child(fragment_20);

			LinkH2(node_37, {
				href: '/note#secondary',
				'aria-label': 'secondary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_24 = $.text('secondary');

					$.append($$anchor, text_24);
				},
				$$slots: { default: true }
			});

			var div_13 = $.sibling(node_37, 2);

			{
				const demo = ($$anchor) => {
					var div_14 = root_8();
					var node_38 = $.child(div_14);

					Note(node_38, {
						type: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_25 = $.text('This note details some secondary information.');

							$.append($$anchor, text_25);
						},
						$$slots: { default: true }
					});

					var node_39 = $.sibling(node_38, 2);

					Note(node_39, {
						type: 'secondary',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_26 = $.text('This note details some secondary information.');

							$.append($$anchor, text_26);
						},
						$$slots: { default: true }
					});

					var node_40 = $.sibling(node_39, 2);

					Note(node_40, {
						type: 'secondary',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_21 = root_7();

							$.next(2);
							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});

					var node_41 = $.sibling(node_40, 2);

					Note(node_41, {
						fill: true,
						type: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_27 = $.text('This note details some secondary information.');

							$.append($$anchor, text_27);
						},
						$$slots: { default: true }
					});

					var node_42 = $.sibling(node_41, 2);

					Note(node_42, {
						fill: true,
						type: 'secondary',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_28 = $.text('This note details some secondary information.');

							$.append($$anchor, text_28);
						},
						$$slots: { default: true }
					});

					var node_43 = $.sibling(node_42, 2);

					Note(node_43, {
						fill: true,
						type: 'secondary',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_22 = root_7();

							$.next(2);
							$.append($$anchor, fragment_22);
						},
						$$slots: { default: true }
					});

					$.reset(div_14);
					$.append($$anchor, div_14);
				};

				var node_44 = $.child(div_13);

				demoAndCode(node_44, () => demo, () => noteSecondary);
				$.reset(div_13);
			}

			$.append($$anchor, fragment_20);
		},
		$$slots: { default: true }
	});
};

const violet = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_24 = root_3();
			var node_45 = $.first_child(fragment_24);

			LinkH2(node_45, {
				href: '/note#violet',
				'aria-label': 'violet',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_29 = $.text('violet');

					$.append($$anchor, text_29);
				},
				$$slots: { default: true }
			});

			var div_15 = $.sibling(node_45, 2);

			{
				const demo = ($$anchor) => {
					var div_16 = root_8();
					var node_46 = $.child(div_16);

					Note(node_46, {
						type: 'violet',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('This note details some violet information.');

							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});

					var node_47 = $.sibling(node_46, 2);

					Note(node_47, {
						type: 'violet',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_31 = $.text('This note details some violet information.');

							$.append($$anchor, text_31);
						},
						$$slots: { default: true }
					});

					var node_48 = $.sibling(node_47, 2);

					Note(node_48, {
						type: 'violet',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_25 = root_7();

							$.next(2);
							$.append($$anchor, fragment_25);
						},
						$$slots: { default: true }
					});

					var node_49 = $.sibling(node_48, 2);

					Note(node_49, {
						fill: true,
						type: 'violet',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_32 = $.text('This note details some violet information.');

							$.append($$anchor, text_32);
						},
						$$slots: { default: true }
					});

					var node_50 = $.sibling(node_49, 2);

					Note(node_50, {
						fill: true,
						type: 'violet',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_33 = $.text('This note details some violet information.');

							$.append($$anchor, text_33);
						},
						$$slots: { default: true }
					});

					var node_51 = $.sibling(node_50, 2);

					Note(node_51, {
						fill: true,
						type: 'violet',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_26 = root_7();

							$.next(2);
							$.append($$anchor, fragment_26);
						},
						$$slots: { default: true }
					});

					$.reset(div_16);
					$.append($$anchor, div_16);
				};

				var node_52 = $.child(div_15);

				demoAndCode(node_52, () => demo, () => noteViolet);
				$.reset(div_15);
			}

			$.append($$anchor, fragment_24);
		},
		$$slots: { default: true }
	});
};

const cyan = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_28 = root_3();
			var node_53 = $.first_child(fragment_28);

			LinkH2(node_53, {
				href: '/note#cyan',
				'aria-label': 'cyan',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_34 = $.text('cyan');

					$.append($$anchor, text_34);
				},
				$$slots: { default: true }
			});

			var div_17 = $.sibling(node_53, 2);

			{
				const demo = ($$anchor) => {
					var div_18 = root_8();
					var node_54 = $.child(div_18);

					Note(node_54, {
						type: 'cyan',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_35 = $.text('This note details some cyan information.');

							$.append($$anchor, text_35);
						},
						$$slots: { default: true }
					});

					var node_55 = $.sibling(node_54, 2);

					Note(node_55, {
						type: 'cyan',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_36 = $.text('This note details some cyan information.');

							$.append($$anchor, text_36);
						},
						$$slots: { default: true }
					});

					var node_56 = $.sibling(node_55, 2);

					Note(node_56, {
						type: 'cyan',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_29 = root_7();

							$.next(2);
							$.append($$anchor, fragment_29);
						},
						$$slots: { default: true }
					});

					var node_57 = $.sibling(node_56, 2);

					Note(node_57, {
						fill: true,
						type: 'cyan',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_37 = $.text('This note details some cyan information.');

							$.append($$anchor, text_37);
						},
						$$slots: { default: true }
					});

					var node_58 = $.sibling(node_57, 2);

					Note(node_58, {
						fill: true,
						type: 'cyan',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_38 = $.text('This note details some cyan information.');

							$.append($$anchor, text_38);
						},
						$$slots: { default: true }
					});

					var node_59 = $.sibling(node_58, 2);

					Note(node_59, {
						fill: true,
						type: 'cyan',
						get action() {
							return actionSnip;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_30 = root_7();

							$.next(2);
							$.append($$anchor, fragment_30);
						},
						$$slots: { default: true }
					});

					$.reset(div_18);
					$.append($$anchor, div_18);
				};

				var node_60 = $.child(div_17);

				demoAndCode(node_60, () => demo, () => noteCyan);
				$.reset(div_17);
			}

			$.append($$anchor, fragment_28);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "modal", href: "/modal" },
				next: { title: "pagination", href: "/pagination" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_33 = root_9();
	var node_61 = $.first_child(fragment_33);

	note(node_61);

	var node_62 = $.sibling(node_61, 2);

	defaultNote(node_62);

	var node_63 = $.sibling(node_62, 2);

	action(node_63);

	var node_64 = $.sibling(node_63, 2);

	success(node_64);

	var node_65 = $.sibling(node_64, 2);

	error(node_65);

	var node_66 = $.sibling(node_65, 2);

	warning(node_66);

	var node_67 = $.sibling(node_66, 2);

	secondary(node_67);

	var node_68 = $.sibling(node_67, 2);

	violet(node_68);

	var node_69 = $.sibling(node_68, 2);

	cyan(node_69);

	var node_70 = $.sibling(node_69, 2);

	prevAndNext(node_70);
	$.append($$anchor, fragment_33);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">note</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Display text that requires attention or provides additional information.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<div class="w-full space-y-6 md:flex md:gap-6 md:space-y-0"><!> <!> <!></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);
var root_5 = $.from_html(`<div class="w-full space-y-6"><!> <!></div>`);
var root_6 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The <!> prop accepts a <!>.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_7 = $.from_html(`This note details some success information. Check <a href="/#" class="hover:underline">the documentation</a> to learn more.`, 1);
var root_8 = $.from_html(`<div class="w-full space-y-6"><!> <!> <!> <!> <!> <!></div>`);
var root_9 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('1t249ed', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Note';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}