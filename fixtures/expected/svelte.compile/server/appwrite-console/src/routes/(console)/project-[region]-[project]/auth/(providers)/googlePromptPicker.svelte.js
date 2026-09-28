import * as $ from 'svelte/internal/server';
import { ProjectOAuth2GooglePrompt } from '@appwrite.io/console';
import { Layout, Tag, Typography } from '@appwrite.io/pink-svelte';

export default function GooglePromptPicker($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = [], onchange } = $$props;

		const options = [
			{ val: ProjectOAuth2GooglePrompt.None, label: 'None' },
			{ val: ProjectOAuth2GooglePrompt.Consent, label: 'Consent' },
			{
				val: ProjectOAuth2GooglePrompt.SelectAccount,
				label: 'Select account'
			}
		];

		function toggle(opt) {
			let next;

			if (opt === ProjectOAuth2GooglePrompt.None) {
				next = value.includes(opt) ? [] : [opt];
			} else {
				next = value.includes(opt)
					? value.filter((v) => v !== opt)
					: [
						...value.filter((v) => v !== ProjectOAuth2GooglePrompt.None),
						opt
					];
			}

			value = next;
			onchange?.(next);
		}

		if (Layout.Stack) {
			$$renderer.push('<!--[-->');

			Layout.Stack($$renderer, {
				gap: 'xs',
				children: ($$renderer) => {
					if (Typography.Text) {
						$$renderer.push('<!--[-->');

						Typography.Text($$renderer, {
							variant: 'm-500',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Prompt`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Layout.Stack) {
						$$renderer.push('<!--[-->');

						Layout.Stack($$renderer, {
							direction: 'row',
							gap: 's',
							flexWrap: 'wrap',
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(options);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let option = each_array[$$index];

									Tag($$renderer, {
										size: 's',
										selected: value.includes(option.val),
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(option.label)}`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$.bind_props($$props, { value });
	});
}