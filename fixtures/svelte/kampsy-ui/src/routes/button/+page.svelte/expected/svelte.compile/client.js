import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ArrowLeft, ArrowRight } from "$lib/icons/index.js";
import { Button } from "$lib/index.js";
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

import {
	buttonDisabled,
	buttonLoading,
	buttonPrefixAndSuffix,
	buttonRounded,
	buttonShapes,
	buttonSize,
	buttonVariants,
	buttonDisabledVariants
} from "../../docs/data/button.js";

import Pagination from "$lib/pagination/pagination.svelte";
import ArrowUp from "$lib/icons/arrow-up.svelte";

const button = ($$anchor) => {
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

const size = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_3();
			var node_2 = $.first_child(fragment_3);

			LinkH2(node_2, {
				href: '/button#size',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('size');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var div_3 = $.sibling(node_2, 4);

			{
				const demo = ($$anchor) => {
					var fragment_4 = root_2();
					var node_3 = $.first_child(fragment_4);

					Button(node_3, {
						size: 'tiny',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Upload');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Button(node_4, {
						size: 'small',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Upload');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Button(node_5, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Upload');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Button(node_6, {
						size: 'large',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Upload');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				};

				var node_7 = $.child(div_3);

				demoAndCode(node_7, () => demo, () => buttonSize);
				$.reset(div_3);
			}

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});
};

const types = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_6 = root_5();
			var node_8 = $.first_child(fragment_6);

			LinkH2(node_8, {
				href: '/button#all-types-and-sizes-in-comparison',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('All Types and Sizes in comparison');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var div_4 = $.sibling(node_8, 2);

			{
				const demo = ($$anchor) => {
					var div_5 = root_4();
					var div_6 = $.child(div_5);
					var node_9 = $.child(div_6);

					Button(node_9, {
						size: 'small',
						variant: 'default',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Upload');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Button(node_10, {
						size: 'small',
						variant: 'error',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Upload');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_11 = $.sibling(node_10, 2);

					Button(node_11, {
						size: 'small',
						variant: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Upload');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					Button(node_12, {
						size: 'small',
						variant: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Upload');

							$.append($$anchor, text_9);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					Button(node_13, {
						size: 'small',
						variant: 'tertiary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('Upload');

							$.append($$anchor, text_10);
						},
						$$slots: { default: true }
					});

					$.reset(div_6);

					var div_7 = $.sibling(div_6, 2);
					var node_14 = $.child(div_7);

					Button(node_14, {
						variant: 'default',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Upload');

							$.append($$anchor, text_11);
						},
						$$slots: { default: true }
					});

					var node_15 = $.sibling(node_14, 2);

					Button(node_15, {
						variant: 'error',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('Upload');

							$.append($$anchor, text_12);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Button(node_16, {
						variant: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Upload');

							$.append($$anchor, text_13);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Button(node_17, {
						variant: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('Upload');

							$.append($$anchor, text_14);
						},
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Button(node_18, {
						variant: 'tertiary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_15 = $.text('Upload');

							$.append($$anchor, text_15);
						},
						$$slots: { default: true }
					});

					$.reset(div_7);

					var div_8 = $.sibling(div_7, 2);
					var node_19 = $.child(div_8);

					Button(node_19, {
						size: 'large',
						variant: 'default',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_16 = $.text('Upload');

							$.append($$anchor, text_16);
						},
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);

					Button(node_20, {
						size: 'large',
						variant: 'error',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_17 = $.text('Upload');

							$.append($$anchor, text_17);
						},
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);

					Button(node_21, {
						size: 'large',
						variant: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_18 = $.text('Upload');

							$.append($$anchor, text_18);
						},
						$$slots: { default: true }
					});

					var node_22 = $.sibling(node_21, 2);

					Button(node_22, {
						size: 'large',
						variant: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_19 = $.text('Upload');

							$.append($$anchor, text_19);
						},
						$$slots: { default: true }
					});

					var node_23 = $.sibling(node_22, 2);

					Button(node_23, {
						size: 'large',
						variant: 'tertiary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_20 = $.text('Upload');

							$.append($$anchor, text_20);
						},
						$$slots: { default: true }
					});

					$.reset(div_8);
					$.reset(div_5);
					$.append($$anchor, div_5);
				};

				var node_24 = $.child(div_4);

				demoAndCode(node_24, () => demo, () => buttonVariants);
				$.reset(div_4);
			}

			$.append($$anchor, fragment_6);
		},
		$$slots: { default: true }
	});
};

const roundedCode = ($$anchor, rct = $.noop) => {
	var code_1 = root_6();
	var text_21 = $.only_child(code_1, true);

	$.template_effect(() => $.set_text(text_21, rct()));
	$.append($$anchor, code_1);
};

const shapes = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_8 = root_8();
			var node_25 = $.first_child(fragment_8);

			LinkH2(node_25, {
				href: '/button#shapes',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_22 = $.text('shapes');

					$.append($$anchor, text_22);
				},
				$$slots: { default: true }
			});

			var p = $.sibling(node_25, 2);
			var node_26 = $.sibling($.child(p));

			roundedCode(node_26, () => "svgOnly");

			var node_27 = $.sibling(node_26, 2);

			roundedCode(node_27, () => "aria-label");
			$.next();
			$.reset(p);

			var div_9 = $.sibling(p, 2);

			{
				const demo = ($$anchor) => {
					var fragment_9 = root_7();
					var node_28 = $.first_child(fragment_9);

					Button(node_28, {
						'aria-label': 'Upload',
						shape: 'square',
						size: 'tiny',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_29 = $.sibling(node_28, 2);

					Button(node_29, {
						'aria-label': 'Upload',
						shape: 'square',
						size: 'small',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_30 = $.sibling(node_29, 2);

					Button(node_30, {
						'aria-label': 'Upload',
						shape: 'square',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_31 = $.sibling(node_30, 2);

					Button(node_31, {
						'aria-label': 'Upload',
						shape: 'square',
						size: 'large',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_32 = $.sibling(node_31, 2);

					Button(node_32, {
						'aria-label': 'Upload',
						shape: 'circle',
						size: 'tiny',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_33 = $.sibling(node_32, 2);

					Button(node_33, {
						'aria-label': 'Upload',
						shape: 'circle',
						size: 'small',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_34 = $.sibling(node_33, 2);

					Button(node_34, {
						'aria-label': 'Upload',
						shape: 'circle',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					var node_35 = $.sibling(node_34, 2);

					Button(node_35, {
						'aria-label': 'Upload',
						shape: 'circle',
						size: 'large',
						svgOnly: true,
						children: ($$anchor, $$slotProps) => {
							ArrowUp($$anchor, {});
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				};

				var node_36 = $.child(div_9);

				demoAndCode(node_36, () => demo, () => buttonShapes);
				$.reset(div_9);
			}

			$.append($$anchor, fragment_8);
		},
		$$slots: { default: true }
	});
};

const prefixAndSuffix = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_19 = root_5();
			var node_37 = $.first_child(fragment_19);

			LinkH2(node_37, {
				href: '/button#prefix-and-suffix',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_23 = $.text('Prefix and Suffix');

					$.append($$anchor, text_23);
				},
				$$slots: { default: true }
			});

			var div_10 = $.sibling(node_37, 2);

			{
				const demo = ($$anchor) => {
					var fragment_20 = root_9();
					var node_38 = $.first_child(fragment_20);

					{
						const prefix = ($$anchor) => {
							ArrowLeft($$anchor, {});
						};

						Button(node_38, {
							prefix,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_24 = $.text('Upload');

								$.append($$anchor, text_24);
							},
							$$slots: { prefix: true, default: true }
						});
					}

					var node_39 = $.sibling(node_38, 2);

					{
						const suffix = ($$anchor) => {
							ArrowRight($$anchor, {});
						};

						Button(node_39, {
							suffix,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_25 = $.text('Upload');

								$.append($$anchor, text_25);
							},
							$$slots: { suffix: true, default: true }
						});
					}

					var node_40 = $.sibling(node_39, 2);

					{
						const prefix = ($$anchor) => {
							ArrowLeft($$anchor, {});
						};

						const suffix = ($$anchor) => {
							ArrowRight($$anchor, {});
						};

						Button(node_40, {
							prefix,
							suffix,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_26 = $.text('Upload');

								$.append($$anchor, text_26);
							},
							$$slots: { prefix: true, suffix: true, default: true }
						});
					}

					$.append($$anchor, fragment_20);
				};

				var node_41 = $.child(div_10);

				demoAndCode(node_41, () => demo, () => buttonPrefixAndSuffix);
				$.reset(div_10);
			}

			$.append($$anchor, fragment_19);
		},
		$$slots: { default: true }
	});
};

const rounded = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_26 = root_10();
			var node_42 = $.first_child(fragment_26);

			LinkH2(node_42, {
				href: '/button#rounded',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_27 = $.text('rounded');

					$.append($$anchor, text_27);
				},
				$$slots: { default: true }
			});

			var p_1 = $.sibling(node_42, 2);
			var node_43 = $.sibling($.child(p_1));

			roundedCode(node_43, () => 'shape="rounded"');

			var node_44 = $.sibling(node_43, 2);

			roundedCode(node_44, () => "shadow");
			$.next();
			$.reset(p_1);

			var div_11 = $.sibling(p_1, 2);

			{
				const demo = ($$anchor) => {
					var fragment_27 = root_9();
					var node_45 = $.first_child(fragment_27);

					Button(node_45, {
						size: 'small',
						variant: 'secondary',
						shape: 'rounded',
						shadow: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_28 = $.text('Upload');

							$.append($$anchor, text_28);
						},
						$$slots: { default: true }
					});

					var node_46 = $.sibling(node_45, 2);

					Button(node_46, {
						variant: 'secondary',
						shape: 'rounded',
						shadow: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_29 = $.text('Upload');

							$.append($$anchor, text_29);
						},
						$$slots: { default: true }
					});

					var node_47 = $.sibling(node_46, 2);

					Button(node_47, {
						size: 'large',
						variant: 'secondary',
						shape: 'rounded',
						shadow: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('Upload');

							$.append($$anchor, text_30);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_27);
				};

				var node_48 = $.child(div_11);

				demoAndCode(node_48, () => demo, () => buttonRounded);
				$.reset(div_11);
			}

			$.append($$anchor, fragment_26);
		},
		$$slots: { default: true }
	});
};

const loading = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_29 = root_5();
			var node_49 = $.first_child(fragment_29);

			LinkH2(node_49, {
				href: '/button#loading',
				'aria-label': 'loading',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_31 = $.text('loading');

					$.append($$anchor, text_31);
				},
				$$slots: { default: true }
			});

			var div_12 = $.sibling(node_49, 2);

			{
				const demo = ($$anchor) => {
					var fragment_30 = root_9();
					var node_50 = $.first_child(fragment_30);

					Button(node_50, {
						size: 'small',
						loading: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_32 = $.text('Upload');

							$.append($$anchor, text_32);
						},
						$$slots: { default: true }
					});

					var node_51 = $.sibling(node_50, 2);

					Button(node_51, {
						loading: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_33 = $.text('Upload');

							$.append($$anchor, text_33);
						},
						$$slots: { default: true }
					});

					var node_52 = $.sibling(node_51, 2);

					Button(node_52, {
						size: 'large',
						loading: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_34 = $.text('Upload');

							$.append($$anchor, text_34);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_30);
				};

				var node_53 = $.child(div_12);

				demoAndCode(node_53, () => demo, () => buttonLoading);
				$.reset(div_12);
			}

			$.append($$anchor, fragment_29);
		},
		$$slots: { default: true }
	});
};

const disabled = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_32 = root_5();
			var node_54 = $.first_child(fragment_32);

			LinkH2(node_54, {
				href: '/button#disabled',
				'aria-label': 'Disabled',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_35 = $.text('Disabled');

					$.append($$anchor, text_35);
				},
				$$slots: { default: true }
			});

			var div_13 = $.sibling(node_54, 2);

			{
				const demo = ($$anchor) => {
					var fragment_33 = root_9();
					var node_55 = $.first_child(fragment_33);

					Button(node_55, {
						disabled: true,
						size: 'small',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_36 = $.text('Upload');

							$.append($$anchor, text_36);
						},
						$$slots: { default: true }
					});

					var node_56 = $.sibling(node_55, 2);

					Button(node_56, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_37 = $.text('Upload');

							$.append($$anchor, text_37);
						},
						$$slots: { default: true }
					});

					var node_57 = $.sibling(node_56, 2);

					Button(node_57, {
						disabled: true,
						size: 'large',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_38 = $.text('Upload');

							$.append($$anchor, text_38);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_33);
				};

				var node_58 = $.child(div_13);

				demoAndCode(node_58, () => demo, () => buttonDisabled);
				$.reset(div_13);
			}

			$.append($$anchor, fragment_32);
		},
		$$slots: { default: true }
	});
};

const disabledVariants = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_35 = root_5();
			var node_59 = $.first_child(fragment_35);

			LinkH2(node_59, {
				href: '/button#disabled-variants',
				'aria-label': 'Disabled variants',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_39 = $.text('Disabled variants');

					$.append($$anchor, text_39);
				},
				$$slots: { default: true }
			});

			var div_14 = $.sibling(node_59, 2);

			{
				const demo = ($$anchor) => {
					var fragment_36 = root_11();
					var node_60 = $.first_child(fragment_36);

					Button(node_60, {
						disabled: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_40 = $.text('Default');

							$.append($$anchor, text_40);
						},
						$$slots: { default: true }
					});

					var node_61 = $.sibling(node_60, 2);

					Button(node_61, {
						disabled: true,
						variant: 'secondary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_41 = $.text('Secondary');

							$.append($$anchor, text_41);
						},
						$$slots: { default: true }
					});

					var node_62 = $.sibling(node_61, 2);

					Button(node_62, {
						disabled: true,
						variant: 'tertiary',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_42 = $.text('Tertiary');

							$.append($$anchor, text_42);
						},
						$$slots: { default: true }
					});

					var node_63 = $.sibling(node_62, 2);

					Button(node_63, {
						disabled: true,
						variant: 'error',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_43 = $.text('Error');

							$.append($$anchor, text_43);
						},
						$$slots: { default: true }
					});

					var node_64 = $.sibling(node_63, 2);

					Button(node_64, {
						disabled: true,
						variant: 'warning',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_44 = $.text('Warning');

							$.append($$anchor, text_44);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_36);
				};

				var node_65 = $.child(div_14);

				demoAndCode(node_65, () => demo, () => buttonDisabledVariants);
				$.reset(div_14);
			}

			$.append($$anchor, fragment_35);
		},
		$$slots: { default: true }
	});
};

const bestPractices = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_38 = root_12();
			var div_15 = $.sibling($.first_child(fragment_38), 2);
			var ul = $.child(div_15);
			var li = $.child(ul);
			var node_66 = $.sibling($.child(li));

			roundedCode(node_66, () => "Button");

			var node_67 = $.sibling(node_66, 2);

			roundedCode(node_67, () => "ButtonLink");
			$.next(5);
			$.reset(li);

			var li_1 = $.sibling(li, 2);
			var node_68 = $.sibling($.child(li_1));

			roundedCode(node_68, () => "Button");

			var node_69 = $.sibling(node_68, 2);

			roundedCode(node_69, () => 'variant="secondary"');

			var node_70 = $.sibling(node_69, 2);

			roundedCode(node_70, () => 'variant="error"');

			var node_71 = $.sibling(node_70, 2);

			roundedCode(node_71, () => "primary");

			var node_72 = $.sibling(node_71, 2);

			roundedCode(node_72, () => "success");

			var node_73 = $.sibling(node_72, 2);

			roundedCode(node_73, () => "ghost");

			var node_74 = $.sibling(node_73, 2);

			roundedCode(node_74, () => "violet");

			var node_75 = $.sibling(node_74, 2);

			roundedCode(node_75, () => "variant");
			$.next();
			$.reset(li_1);

			var li_2 = $.sibling(li_1, 2);
			var node_76 = $.sibling($.child(li_2));

			roundedCode(node_76, () => 'type="submit"');

			var node_77 = $.sibling(node_76, 2);

			roundedCode(node_77, () => "type");

			var node_78 = $.sibling(node_77, 2);

			roundedCode(node_78, () => "variant");
			$.next();
			$.reset(li_2);

			var li_3 = $.sibling(li_2, 2);
			var node_79 = $.sibling($.child(li_3));

			roundedCode(node_79, () => "loading");
			$.next();
			$.reset(li_3);

			var li_4 = $.sibling(li_3, 4);
			var node_80 = $.sibling($.child(li_4));

			roundedCode(node_80, () => "Deploy Project");

			var node_81 = $.sibling(node_80, 2);

			roundedCode(node_81, () => "Invite Member");

			var node_82 = $.sibling(node_81, 2);

			roundedCode(node_82, () => "Rotate Key");

			var node_83 = $.sibling(node_82, 2);

			roundedCode(node_83, () => "Submit");

			var node_84 = $.sibling(node_83, 2);

			roundedCode(node_84, () => "OK");

			var node_85 = $.sibling(node_84, 2);

			roundedCode(node_85, () => "Confirm");
			$.next();
			$.reset(li_4);

			var li_5 = $.sibling(li_4, 2);
			var node_86 = $.sibling($.child(li_5));

			roundedCode(node_86, () => "Verb + Noun");

			var node_87 = $.sibling(node_86, 2);

			roundedCode(node_87, () => "Delete Project");

			var node_88 = $.sibling(node_87, 2);

			roundedCode(node_88, () => "Project deleted");

			var node_89 = $.sibling(node_88, 2);

			roundedCode(node_89, () => "Instead");

			var node_90 = $.sibling(node_89, 2);

			roundedCode(node_90, () => "Use a Recovery Code Instead");
			$.next();
			$.reset(li_5);

			var li_6 = $.sibling(li_5, 2);
			var node_91 = $.sibling($.child(li_6));

			roundedCode(node_91, () => "svgOnly");

			var node_92 = $.sibling(node_91, 2);

			roundedCode(node_92, () => "aria-label");

			var node_93 = $.sibling(node_92, 2);

			roundedCode(node_93, () => "aria-label");

			var node_94 = $.sibling(node_93, 2);

			roundedCode(node_94, () => "Copy deployment URL");

			var node_95 = $.sibling(node_94, 2);

			roundedCode(node_95, () => "Copy");
			$.next();
			$.reset(li_6);

			var li_7 = $.sibling(li_6, 2);
			var node_96 = $.sibling($.child(li_7));

			roundedCode(node_96, () => "aria-label");
			$.next();
			$.reset(li_7);
			$.reset(ul);
			$.reset(div_15);
			$.append($$anchor, fragment_38);
		},
		$$slots: { default: true }
	});
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "badge", href: "/badge" },
				next: { title: "calendar", href: "/calendar" }
			});
		},
		$$slots: { default: true }
	});
};

const cont = ($$anchor) => {
	var fragment_41 = root_13();
	var node_97 = $.first_child(fragment_41);

	button(node_97);

	var node_98 = $.sibling(node_97, 2);

	size(node_98);

	var node_99 = $.sibling(node_98, 2);

	types(node_99);

	var node_100 = $.sibling(node_99, 2);

	shapes(node_100);

	var node_101 = $.sibling(node_100, 2);

	prefixAndSuffix(node_101);

	var node_102 = $.sibling(node_101, 2);

	rounded(node_102);

	var node_103 = $.sibling(node_102, 2);

	loading(node_103);

	var node_104 = $.sibling(node_103, 2);

	disabled(node_104);

	var node_105 = $.sibling(node_104, 2);

	disabledVariants(node_105);

	var node_106 = $.sibling(node_105, 2);

	bestPractices(node_106);

	var node_107 = $.sibling(node_106, 2);

	prevAndNext(node_107);
	$.append($$anchor, fragment_41);
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">button</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Trigger an action or event, such as submitting a form or displaying a dialog.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex flex-initial flex-col items-start gap-4 md:flex-row"><!></div></div> <!></div>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The default size is medium.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<div class="flex flex-col gap-6"><div class="flex items-center gap-3"><!> <!> <!> <!> <!></div> <div class="flex items-center gap-3"><!> <!> <!> <!> <!></div> <div class="flex items-center gap-3"><!> <!> <!> <!> <!></div></div>`);
var root_5 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_6 = $.from_html(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs"> </code>`);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_8 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Icon-only buttons should include the <!> prop and an <!>.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_9 = $.from_html(`<!> <!> <!>`, 1);
var root_10 = $.from_html(`<!> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Combination of <!> and the <!> prop, often used on marketing pages.</p> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_11 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

var root_12 = $.from_html(
	`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">Best Practices</h2> <div class="mt-4"><ul class="mt-4 list-disc"><li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Use <!> for actions that mutate state (deploy, save, delete);
					use <!> for navigation that changes the URL. Switch to
					a <a href="/menu" class="underline">Menu</a> or <a href="/split-button" class="underline">Split Button</a> when more than one related action
					shares a row.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Default <!> is the primary style. Pass <!> for the supporting action and <!> for destructive
					confirmations. <!>, <!>, <!>, and <!> are not valid <!> values.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">For form submits, use <!>. The HTML <!> attribute controls the button behavior; the visual style lives on <!>.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Pass <!> instead of swapping in a spinner so the button stays
					focusable and announces the busy state to assistive tech.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Disable a button only when the action is impossible right now (missing input,
					insufficient permission); pair with a <a href="/tooltip" class="underline">Tooltip</a> that explains why.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Title Case the label and name what happens: <!>, <!>, <!>. Avoid bare verbs (<!>) and generic confirms (<!>, <!>).</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Destructive buttons follow <!> and pair 1:1 with their
					toast: <!> then <!>. Mode-switch buttons append <!>: <!>.</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Icon-only buttons require both <!> and <!>; the component warns in development without them. The <!> names the action and the target (<!>),
					not the icon (<!>).</li> <li class="[&amp;_strong]:text-kui-light-gray-1000 text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 ml-8 py-0.5 leading-6 [&amp;_strong]:font-normal">Don't set <!> on a button that already has visible text;
					it overrides the label and creates a screen-reader mismatch.</li></ul></div>`,
	1
);

var root_13 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function _page($$anchor) {
	$.head('mccg8t', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Button';
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