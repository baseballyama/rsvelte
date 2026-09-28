import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { BitsConfig, getBitsConfig } from "bits-ui";

var root = $.from_html(`<div data-testid="root-config"><span data-testid="root-config-portal"> </span> <span data-testid="root-config-locale"> </span></div>`);
var root_1 = $.from_html(`<div data-testid="child-inherits"><span data-testid="child-inherits-portal"> </span> <span data-testid="child-inherits-locale"> </span></div>`);
var root_2 = $.from_html(`<div data-testid="child-overrides"><span data-testid="child-overrides-portal"> </span> <span data-testid="child-overrides-locale"> </span></div>`);
var root_3 = $.from_html(`<div data-testid="deep-nesting"><span data-testid="deep-nesting-portal"> </span> <span data-testid="deep-nesting-locale"> </span></div>`);
var root_4 = $.from_html(`<div data-testid="partial-override"><span data-testid="partial-override-portal"> </span> <span data-testid="partial-override-locale"> </span></div>`);
var root_5 = $.from_html(`<div data-testid="no-config"><span data-testid="no-config-portal"> </span> <span data-testid="no-config-locale"> </span></div> <!> <!> <!> <!> <!>`, 1);

export default function Bits_config_test($$anchor, $$props) {
	$.push($$props, true);

	function ConfigDisplay() {
		const config = getBitsConfig();
		const portalTo = config.defaultPortalTo?.current;
		const locale = config.defaultLocale?.current;

		return {
			portalTo: portalTo ?? "undefined",
			locale: locale ?? "undefined"
		};
	}

	const noConfigResult = ConfigDisplay();
	var fragment = root_5();
	var div = $.first_child(fragment);
	var span = $.child(div);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);

	$.reset(div);

	var node = $.sibling(div, 2);

	BitsConfig(node, {
		defaultPortalTo: '#root-portal',
		defaultLocale: 'en',
		children: ($$anchor, $$slotProps) => {
			const result = $.derived(ConfigDisplay);
			var div_1 = root();
			var span_2 = $.child(div_1);
			var text_2 = $.only_child(span_2, true);
			var span_3 = $.sibling(span_2, 2);
			var text_3 = $.only_child(span_3, true);

			$.reset(div_1);

			$.template_effect(() => {
				$.set_text(text_2, $.get(result).portalTo);
				$.set_text(text_3, $.get(result).locale);
			});

			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	BitsConfig(node_1, {
		defaultPortalTo: '#parent-portal',
		defaultLocale: 'en',
		children: ($$anchor, $$slotProps) => {
			BitsConfig($$anchor, {
				children: ($$anchor, $$slotProps) => {
					const result = $.derived(ConfigDisplay);
					var div_2 = root_1();
					var span_4 = $.child(div_2);
					var text_4 = $.only_child(span_4, true);
					var span_5 = $.sibling(span_4, 2);
					var text_5 = $.only_child(span_5, true);

					$.reset(div_2);

					$.template_effect(() => {
						$.set_text(text_4, $.get(result).portalTo);
						$.set_text(text_5, $.get(result).locale);
					});

					$.append($$anchor, div_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	BitsConfig(node_2, {
		defaultPortalTo: '#parent-portal',
		defaultLocale: 'en',
		children: ($$anchor, $$slotProps) => {
			BitsConfig($$anchor, {
				defaultPortalTo: '#child-portal',
				children: ($$anchor, $$slotProps) => {
					const result = $.derived(ConfigDisplay);
					var div_3 = root_2();
					var span_6 = $.child(div_3);
					var text_6 = $.only_child(span_6, true);
					var span_7 = $.sibling(span_6, 2);
					var text_7 = $.only_child(span_7, true);

					$.reset(div_3);

					$.template_effect(() => {
						$.set_text(text_6, $.get(result).portalTo);
						$.set_text(text_7, $.get(result).locale);
					});

					$.append($$anchor, div_3);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	BitsConfig(node_3, {
		defaultPortalTo: '#level1',
		defaultLocale: 'en',
		children: ($$anchor, $$slotProps) => {
			BitsConfig($$anchor, {
				defaultLocale: 'es',
				children: ($$anchor, $$slotProps) => {
					BitsConfig($$anchor, {
						children: ($$anchor, $$slotProps) => {
							const result = $.derived(ConfigDisplay);
							var div_4 = root_3();
							var span_8 = $.child(div_4);
							var text_8 = $.only_child(span_8, true);
							var span_9 = $.sibling(span_8, 2);
							var text_9 = $.only_child(span_9, true);

							$.reset(div_4);

							$.template_effect(() => {
								$.set_text(text_8, $.get(result).portalTo);
								$.set_text(text_9, $.get(result).locale);
							});

							$.append($$anchor, div_4);
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

	BitsConfig(node_4, {
		defaultPortalTo: '#base',
		defaultLocale: 'en',
		children: ($$anchor, $$slotProps) => {
			BitsConfig($$anchor, {
				defaultLocale: 'fr',
				children: ($$anchor, $$slotProps) => {
					BitsConfig($$anchor, {
						defaultPortalTo: '#override',
						children: ($$anchor, $$slotProps) => {
							const result = $.derived(ConfigDisplay);
							var div_5 = root_4();
							var span_10 = $.child(div_5);
							var text_10 = $.only_child(span_10, true);
							var span_11 = $.sibling(span_10, 2);
							var text_11 = $.only_child(span_11, true);

							$.reset(div_5);

							$.template_effect(() => {
								$.set_text(text_10, $.get(result).portalTo);
								$.set_text(text_11, $.get(result).locale);
							});

							$.append($$anchor, div_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.template_effect(() => {
		$.set_text(text, noConfigResult.portalTo);
		$.set_text(text_1, noConfigResult.locale);
	});

	$.append($$anchor, fragment);
	$.pop();
}