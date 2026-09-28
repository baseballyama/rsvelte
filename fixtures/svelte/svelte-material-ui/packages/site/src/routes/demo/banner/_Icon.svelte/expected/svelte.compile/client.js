import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Banner, { Label, Icon, CloseReason } from '@smui/banner';
import Button from '@smui/button';
import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
import Checkbox from '@smui/checkbox';
import FormField from '@smui/form-field';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div><!> <!> <!></div> <pre class="status"> </pre> <div class="top-app-bar-container"><!> <!> <div><img alt="Page content placeholder" src="/page-content.jpg" style="display: block; max-width: 100%; height: auto; margin: 1em auto;"/></div></div>`, 1);

export default function _Icon($$anchor, $$props) {
	$.push($$props, true);

	let open = $.state(false);
	let centered = $.state(false);
	let mobileStacked = $.state(true);

	const closedReasons = {
		[CloseReason.PRIMARY]: 'Primary',
		[CloseReason.SECONDARY]: 'Secondary',
		[CloseReason.UNSPECIFIED]: 'Unspecified'
	};

	let closedReason = $.state('None yet.');

	function handleBannerClosed(event) {
		$.set(closedReason, closedReasons[event.detail.reason], true);
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	{
		const label = ($$anchor) => {
			$.next();

			var text = $.text('Open');

			$.append($$anchor, text);
		};

		FormField(node, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(open);
					},

					set checked($$value) {
						$.set(open, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_1 = $.text('Centered');

			$.append($$anchor, text_1);
		};

		FormField(node_1, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(centered);
					},

					set checked($$value) {
						$.set(centered, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		const label = ($$anchor) => {
			$.next();

			var text_2 = $.text('Mobile Stacked');

			$.append($$anchor, text_2);
		};

		FormField(node_2, {
			label,
			children: ($$anchor, $$slotProps) => {
				Checkbox($$anchor, {
					get checked() {
						return $.get(mobileStacked);
					},

					set checked($$value) {
						$.set(mobileStacked, $$value, true);
					}
				});
			},
			$$slots: { label: true, default: true }
		});
	}

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_3 = $.only_child(pre);
	var div_1 = $.sibling(pre, 2);
	var node_3 = $.child(div_1);

	TopAppBar(node_3, {
		variant: 'static',
		children: ($$anchor, $$slotProps) => {
			Row($$anchor, {
				children: ($$anchor, $$slotProps) => {
					Section($$anchor, {
						children: ($$anchor, $$slotProps) => {
							Title($$anchor, {
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_4 = $.text('Top App Bar');

									$.append($$anchor, text_4);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	{
		const icon = ($$anchor) => {
			Icon($$anchor, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('favorite');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});
		};

		const label = ($$anchor) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('This is a banner with an icon and some actions.');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});
		};

		const actions = ($$anchor) => {
			var fragment_9 = root();
			var node_5 = $.first_child(fragment_9);

			Button(node_5, {
				secondary: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Secondary');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Primary');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		};

		Banner(node_4, {
			get centered() {
				return $.get(centered);
			},

			get mobileStacked() {
				return $.get(mobileStacked);
			},
			onSMUIBannerClosed: handleBannerClosed,
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},
			icon,
			label,
			actions,
			$$slots: { icon: true, label: true, actions: true }
		});
	}

	$.next(2);
	$.reset(div_1);
	$.template_effect(() => $.set_text(text_3, `Closed Reason: ${$.get(closedReason) ?? ''}`));
	$.append($$anchor, fragment);
	$.pop();
}