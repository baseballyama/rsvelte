import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Input } from '$lib/components/ui/input';
import { cn } from '$lib/core/utils';
import Label from '../ui/label/label.svelte';
import { FormTextboxRenderer } from '$lib/core/composables/index.js';
import { AlertCircle, Eye, EyeOff } from '@lucide/svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'label',
	'error',
	'schema',
	'validateOnChange',
	'value',
	'class',
	'optional',
	'info',
	'success',
	'type',
	'validityChange'
]);

var root = $.from_html(`<span class="text-xs text-muted-foreground">(Optional)</span>`);
var root_1 = $.from_html(` <!>`, 1);
var root_2 = $.from_html(`<button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 transform"><!></button>`);
var root_3 = $.from_html(`<div class="mt-1 flex items-center space-x-1"><!> <p class="text-sm font-medium text-destructive"> </p></div>`);
var root_4 = $.from_html(`<p class="text-xs text-muted-foreground"> </p>`);
var root_5 = $.from_html(`<div class="mb-3 space-y-2"><!> <div class="relative"><!> <!></div> <!> <!></div>`);

export default function Textbox($$anchor, $$props) {
	const // One id shared by the <Label for> and the <Input id> so the field actually has an accessible
	// name. Prefer a caller-supplied id, then `name` (call sites that already hand-roll an outer
	// <label for="identifier"> pass name="identifier", so those associate for free), then an
	// SSR-stable generated one.
	uid = $.props_id();

	$.push($$props, true);

	let validateOnChange = $.prop($$props, 'validateOnChange', 3, true),
		value = $.prop($$props, 'value', 15),
		className = $.prop($$props, 'class', 3, ''),
		optional = $.prop($$props, 'optional', 3, false),
		info = $.prop($$props, 'info', 3, ''),
		success = $.prop($$props, 'success', 3, false),
		initialType = $.prop($$props, 'type', 3, 'text'),
		validityChange = $.prop($$props, 'validityChange', 3, () => {}),
		props = $.rest_props($$props, rest_excludes);

	// One id shared by the <Label for> and the <Input id> so the field actually has an accessible
	// name. Prefer a caller-supplied id, then `name` (call sites that already hand-roll an outer
	// <label for="identifier"> pass name="identifier", so those associate for free), then an
	// SSR-stable generated one.
	const inputId = $.derived(() => $$props.id ?? $$props.name ?? uid);

	{
		const content = ($$anchor, $$arg0) => {
			let showPassword = () => ($$arg0?.()).showPassword;
			let type = () => ($$arg0?.()).type;
			let touched = () => ($$arg0?.()).touched;
			let validationError = () => ($$arg0?.()).validationError;
			let isValid = () => ($$arg0?.()).isValid;
			let handleInput = () => ($$arg0?.()).handleInput;
			let togglePassword = () => ($$arg0?.()).togglePassword;
			var div = root_5();
			var node = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					Label($$anchor, {
						get for() {
							return $.get(inputId);
						},
						class: 'block text-sm font-medium',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_2 = root_1();
							var text = $.first_child(fragment_2);
							var node_1 = $.sibling(text);

							{
								var consequent = ($$anchor) => {
									var span = root();

									$.append($$anchor, span);
								};

								$.if(node_1, ($$render) => {
									if (optional()) $$render(consequent);
								});
							}

							$.template_effect(() => $.set_text(text, `${$$props.label ?? ''} `));
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				};

				$.if(node, ($$render) => {
					if ($$props.label) $$render(consequent_1);
				});
			}

			var div_1 = $.sibling(node, 2);
			var node_2 = $.child(div_1);

			{
				let $0 = $.derived(() => cn(className(), 'w-full', touched()
					? isValid()
						? 'border-green-500 focus:border-green-500'
						: 'border-red-500 focus:border-red-500'
					: 'border-gray-200'));

				Input(node_2, $.spread_props(() => props, {
					get id() {
						return $.get(inputId);
					},

					get type() {
						return type();
					},

					oninput: (e) => {
						handleInput()(e);
						$$props.oninput?.(e);
					},

					get class() {
						return $.get($0);
					},

					get value() {
						return value();
					},

					set value($$value) {
						value($$value);
					}
				}));
			}

			var node_3 = $.sibling(node_2, 2);

			{
				var consequent_3 = ($$anchor) => {
					var button = root_2();
					var node_4 = $.child(button);

					{
						var consequent_2 = ($$anchor) => {
							EyeOff($$anchor, { class: 'h-4 w-4 text-gray-500 hover:text-gray-700' });
						};

						var alternate = ($$anchor) => {
							Eye($$anchor, { class: 'h-4 w-4 text-gray-500 hover:text-gray-700' });
						};

						$.if(node_4, ($$render) => {
							if (showPassword()) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.reset(button);

					$.template_effect(() => {
						$.set_attribute(button, 'aria-label', showPassword() ? 'Hide password' : 'Show password');
						$.set_attribute(button, 'aria-controls', $.get(inputId));
					});

					$.delegated('click', button, function (...$$args) {
						togglePassword()?.apply(this, $$args);
					});

					$.append($$anchor, button);
				};

				$.if(node_3, ($$render) => {
					if (initialType() === 'password') $$render(consequent_3);
				});
			}

			$.reset(div_1);

			var node_5 = $.sibling(div_1, 2);

			{
				var consequent_4 = ($$anchor) => {
					var div_2 = root_3();
					var node_6 = $.child(div_2);

					AlertCircle(node_6, { class: 'h-4 w-4 text-destructive' });

					var p = $.sibling(node_6, 2);
					var text_1 = $.only_child(p, true);

					$.reset(div_2);

					$.template_effect(($0) => $.set_text(text_1, $0), [
						() => validationError() || (Array.isArray($$props.error) ? $$props.error[0] : $$props.error)
					]);

					$.append($$anchor, div_2);
				};

				$.if(node_5, ($$render) => {
					if ((validationError() || $$props.error) && touched()) $$render(consequent_4);
				});
			}

			var node_7 = $.sibling(node_5, 2);

			{
				var consequent_5 = ($$anchor) => {
					var p_1 = root_4();
					var text_2 = $.only_child(p_1, true);

					$.template_effect(() => $.set_text(text_2, info()));
					$.append($$anchor, p_1);
				};

				$.if(node_7, ($$render) => {
					if (info()) $$render(consequent_5);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		FormTextboxRenderer($$anchor, {
			get error() {
				return $$props.error;
			},

			get schema() {
				return $$props.schema;
			},

			get validityChange() {
				return validityChange();
			},

			get initialType() {
				return initialType();
			},

			get validateOnChange() {
				return validateOnChange();
			},
			content,
			$$slots: { content: true }
		});
	}

	$.pop();
}

$.delegate(['click']);