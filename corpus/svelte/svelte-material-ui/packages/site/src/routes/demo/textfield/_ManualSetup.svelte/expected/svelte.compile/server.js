import * as $ from 'svelte/internal/server';
import Textfield, { Input, Textarea } from '@smui/textfield';
import Icon from '@smui/textfield/icon';
import HelperText from '@smui/textfield/helper-text';
import FloatingLabel from '@smui/floating-label';
import LineRipple from '@smui/line-ripple';
import NotchedOutline from '@smui/notched-outline';

export default function _ManualSetup($$renderer) {
	// Manual Setup requires passing the lower components up to the Textfield
	let valueA = '';

	let inputA = void 0;
	let floatingLabelA = void 0;
	let lineRippleA = void 0;
	let valueB = '';
	let inputB = void 0;
	let floatingLabelB = void 0;
	let lineRippleB = void 0;
	let valueC = '';
	let inputC = void 0;
	let notchedOutlineC = void 0;
	let floatingLabelC = void 0;
	let valueD = '';
	let inputD = void 0;
	let notchedOutlineD = void 0;
	let floatingLabelD = void 0;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="columns margins"><div>`);

		{
			function label($$renderer) {
				FloatingLabel($$renderer, {
					for: 'input-manual-a',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Standard`);
					},
					$$slots: { default: true }
				});
			}

			function line($$renderer) {
				LineRipple($$renderer, {});
			}

			function helper($$renderer) {
				HelperText($$renderer, {
					id: 'helper-text-manual-a',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				input: inputA,
				floatingLabel: floatingLabelA,
				lineRipple: lineRippleA,
				label,
				line,
				helper,
				children: ($$renderer) => {
					Input($$renderer, {
						id: 'input-manual-a',
						'aria-controls': 'helper-text-manual-a',
						'aria-describedby': 'helper-text-manual-a',
						get value() {
							return valueA;
						},

						set value($$value) {
							valueA = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, line: true, helper: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueA)}</pre></div> <div>`);

		{
			function label($$renderer) {
				FloatingLabel($$renderer, {
					for: 'input-manual-b',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Filled`);
					},
					$$slots: { default: true }
				});
			}

			function line($$renderer) {
				LineRipple($$renderer, {});
			}

			function helper($$renderer) {
				HelperText($$renderer, {
					id: 'helper-text-manual-b',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				input: inputB,
				floatingLabel: floatingLabelB,
				lineRipple: lineRippleB,
				variant: 'filled',
				label,
				line,
				helper,
				children: ($$renderer) => {
					Input($$renderer, {
						id: 'input-manual-b',
						'aria-controls': 'helper-text-manual-b',
						'aria-describedby': 'helper-text-manual-b',
						get value() {
							return valueB;
						},

						set value($$value) {
							valueB = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, line: true, helper: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueB)}</pre></div> <div>`);

		{
			function label($$renderer) {
				NotchedOutline($$renderer, {
					children: ($$renderer) => {
						FloatingLabel($$renderer, {
							for: 'input-manual-c',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Outlined`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			function leadingIcon($$renderer) {
				Icon($$renderer, {
					class: 'material-icons',
					children: ($$renderer) => {
						$$renderer.push(`<!---->event`);
					},
					$$slots: { default: true }
				});
			}

			function helper($$renderer) {
				HelperText($$renderer, {
					id: 'helper-text-manual-c',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				input: inputC,
				notchedOutline: notchedOutlineC,
				floatingLabel: floatingLabelC,
				variant: 'outlined',
				label,
				leadingIcon,
				helper,
				children: ($$renderer) => {
					Input($$renderer, {
						id: 'input-manual-c',
						'aria-controls': 'helper-text-manual-c',
						'aria-describedby': 'helper-text-manual-c',
						get value() {
							return valueC;
						},

						set value($$value) {
							valueC = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, leadingIcon: true, helper: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueC)}</pre></div> <div>`);

		{
			function label($$renderer) {
				NotchedOutline($$renderer, {
					children: ($$renderer) => {
						FloatingLabel($$renderer, {
							for: 'input-manual-d',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Textarea`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}

			function helper($$renderer) {
				HelperText($$renderer, {
					id: 'helper-text-manual-d',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Helper Text`);
					},
					$$slots: { default: true }
				});
			}

			Textfield($$renderer, {
				input: inputD,
				notchedOutline: notchedOutlineD,
				floatingLabel: floatingLabelD,
				textarea: true,
				label,
				helper,
				children: ($$renderer) => {
					Textarea($$renderer, {
						id: 'input-manual-d',
						'aria-controls': 'helper-text-manual-d',
						'aria-describedby': 'helper-text-manual-d',
						get value() {
							return valueD;
						},

						set value($$value) {
							valueD = $$value;
							$$settled = false;
						}
					});
				},
				$$slots: { label: true, helper: true, default: true }
			});
		}

		$$renderer.push(`<!----> <pre class="status">Value: ${$.escape(valueD)}</pre></div></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}