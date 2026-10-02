import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '$lib/components/Chart/Chart.svelte';
import Layer from '$lib/components/layers/Layer.svelte';
import ComponentNodeLifecycleChild from './ComponentNodeLifecycleChild.svelte';
import ComponentNodeLifecycleParent from './ComponentNodeLifecycleParent.svelte';

var root = $.from_html(`<button type="button" data-testid="toggle-child">toggle</button> <!>`, 1);

export default function ComponentNodeLifecycleHarness($$anchor, $$props) {
	$.push($$props, true);

	let chartContext = $.state(void 0);
	let showChild = $.state(true);

	$.user_effect(() => {
		if ($.get(chartContext)) {
			$$props.oncontext?.($.get(chartContext));
		}
	});

	function toggleChild() {
		$.set(showChild, !$.get(showChild));
	}

	var fragment = root();
	var button = $.first_child(fragment);
	var node = $.sibling(button, 2);

	Chart(node, {
		data: [{ date: '2024-01', value: 10 }],
		x: 'date',
		y: 'value',
		width: 300,
		height: 300,
		get context() {
			return $.get(chartContext);
		},

		set context($$value) {
			$.set(chartContext, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				type: 'html',
				children: ($$anchor, $$slotProps) => {
					ComponentNodeLifecycleParent($$anchor, {
						get onparentnode() {
							return $$props.onparentnode;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							{
								var consequent = ($$anchor) => {
									ComponentNodeLifecycleChild($$anchor, {});
								};

								$.if(node_1, ($$render) => {
									if ($.get(showChild)) $$render(consequent);
								});
							}

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.delegated('click', button, toggleChild);
	$.append($$anchor, fragment);
	$.pop();
}

$.delegate(['click']);