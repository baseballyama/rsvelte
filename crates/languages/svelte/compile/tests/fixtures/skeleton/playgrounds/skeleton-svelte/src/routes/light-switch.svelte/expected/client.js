import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MoonIcon from '@lucide/svelte/icons/moon';
import SunIcon from '@lucide/svelte/icons/sun';
import { Switch } from '@skeletonlabs/skeleton-svelte';

var root = $.with_script($.from_html(
	`<script>
		const mode = localStorage.getItem('mode') || 'light';
		document.documentElement.setAttribute('data-mode', mode);
	</script><!>`,
	1
));

var root_1 = $.from_html(`<!> <!>`, 1);

export default function Light_switch($$anchor, $$props) {
	$.push($$props, true);

	let checked = $.state(false);

	$.user_effect(() => {
		const mode = localStorage.getItem('mode') || 'light';

		$.set(checked, mode === 'dark');
	});

	const onCheckedChange = (event) => {
		const mode = event.checked ? 'dark' : 'light';

		document.documentElement.setAttribute('data-mode', mode);
		localStorage.setItem('mode', mode);
		$.set(checked, event.checked, true);
	};

	$.head('12cbsj2', ($$anchor) => {
		var fragment = root();
		var node = $.sibling($.first_child(fragment));

		$.append($$anchor, fragment);
	});

	Switch($$anchor, {
		get checked() {
			return $.get(checked);
		},
		onCheckedChange,
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_1 = $.first_child(fragment_2);

			$.component(node_1, () => Switch.Control, ($$anchor, Switch_Control) => {
				Switch_Control($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_3 = $.comment();
						var node_2 = $.first_child(fragment_3);

						$.component(node_2, () => Switch.Thumb, ($$anchor, Switch_Thumb) => {
							Switch_Thumb($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = $.comment();
									var node_3 = $.first_child(fragment_4);

									{
										const children = ($$anchor, switch_ = $.noop) => {
											var fragment_5 = $.comment();
											var node_4 = $.first_child(fragment_5);

											{
												var consequent = ($$anchor) => {
													SunIcon($$anchor, { class: 'size-4 stroke-surface-50-950' });
												};

												var d = $.derived(() => switch_()().checked);

												var alternate = ($$anchor) => {
													MoonIcon($$anchor, { class: 'size-4 stroke-surface-950-50' });
												};

												$.if(node_4, ($$render) => {
													if ($.get(d)) $$render(consequent); else $$render(alternate, -1);
												});
											}

											$.append($$anchor, fragment_5);
										};

										$.component(node_3, () => Switch.Context, ($$anchor, Switch_Context) => {
											Switch_Context($$anchor, { children, $$slots: { default: true } });
										});
									}

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_3);
					},
					$$slots: { default: true }
				});
			});

			var node_5 = $.sibling(node_1, 2);

			$.component(node_5, () => Switch.HiddenInput, ($$anchor, Switch_HiddenInput) => {
				Switch_HiddenInput($$anchor, {});
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.pop();
}