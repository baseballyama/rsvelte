import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { enhance, applyAction } from "$app/forms";
import { page } from "$app/stores";

var root = $.from_html(`<div class="text-xl font-bold mb-3 w-48 md:pr-8 flex-none"> </div>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`);
var root_2 = $.from_html(`<div><!> <span> </span></div>`);
var root_3 = $.from_html(`<label><span class="text-sm text-gray-500"> </span></label>`);
var root_4 = $.from_html(`<input/>`);
var root_5 = $.from_html(`<div class="text-lg mb-3"> </div>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<p class="text-red-700 text-sm font-bold mt-1"> </p>`);
var root_8 = $.from_html(`<span class="loading loading-spinner loading-md align-middle mx-3"></span>`);
var root_9 = $.from_html(`<div><button type="submit"><!></button></div>`);
var root_10 = $.from_html(`<a class="mt-1"><button> </button></a>`);
var root_11 = $.from_html(`<!> <form class="form-widget flex flex-col" method="POST"><!> <!> <!></form>`, 1);
var root_12 = $.from_html(`<div><div class="text-l font-bold"> </div> <div class="text-base"> </div></div> <a href="/account/settings"><button class="btn btn-outline btn-sm mt-3 min-w-[145px]">Return to Settings</button></a>`, 1);
var root_13 = $.from_html(`<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow-sm"><!> <div class="w-full min-w-48"><!></div></div>`);

export default function Settings_module($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const fieldError = (liveForm, name) => {
		let errors = liveForm?.errorFields ?? [];

		return errors.includes(name);
	};

	// Page state
	let loading = $.state(false);

	let showSuccess = $.state(false);

	// default is "text"
	// Module context
	let editable = $.prop($$props, 'editable', 3, false),
		dangerous = $.prop($$props, 'dangerous', 3, false),
		title = $.prop($$props, 'title', 3, ""),
		message = $.prop($$props, 'message', 3, ""),
		formTarget = $.prop($$props, 'formTarget', 3, ""),
		successTitle = $.prop($$props, 'successTitle', 3, "Success"),
		successBody = $.prop($$props, 'successBody', 3, ""),
		editButtonTitle = $.prop($$props, 'editButtonTitle', 3, null),
		editLink = $.prop($$props, 'editLink', 3, null),
		saveButtonTitle = $.prop($$props, 'saveButtonTitle', 3, "Save");

	const handleSubmit = () => {
		$.set(loading, true);

		return async ({ update, result }) => {
			await update({ reset: false });
			await applyAction(result);
			$.set(loading, false);

			if (result.type === "success") {
				$.set(showSuccess, true);
			}
		};
	};

	var div = root_13();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var text = $.only_child(div_1, true);

			$.template_effect(() => $.set_text(text, title()));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if (title()) $$render(consequent);
		});
	}

	var div_2 = $.sibling(node, 2);
	var node_1 = $.child(div_2);

	{
		var consequent_9 = ($$anchor) => {
			var fragment = root_11();
			var node_2 = $.first_child(fragment);

			{
				var consequent_2 = ($$anchor) => {
					var div_3 = root_2();
					var node_3 = $.child(div_3);

					{
						var consequent_1 = ($$anchor) => {
							var svg = root_1();

							$.append($$anchor, svg);
						};

						$.if(node_3, ($$render) => {
							if (dangerous()) $$render(consequent_1);
						});
					}

					var span = $.sibling(node_3, 2);
					var text_1 = $.only_child(span, true);

					$.reset(div_3);

					$.template_effect(() => {
						$.set_class(div_3, 1, `mb-6 ${dangerous() ? 'alert alert-warning' : ''}`);
						$.set_text(text_1, message());
					});

					$.append($$anchor, div_3);
				};

				$.if(node_2, ($$render) => {
					if (message()) $$render(consequent_2);
				});
			}

			var form = $.sibling(node_2, 2);
			var node_4 = $.child(form);

			$.each(node_4, 17, () => $$props.fields, $.index, ($$anchor, field) => {
				var fragment_1 = root_6();
				var node_5 = $.first_child(fragment_1);

				{
					var consequent_3 = ($$anchor) => {
						var label = root_3();
						var span_1 = $.child(label);
						var text_2 = $.only_child(span_1, true);

						$.reset(label);

						$.template_effect(() => {
							$.set_attribute(label, 'for', $.get(field).id);
							$.set_text(text_2, $.get(field).label);
						});

						$.append($$anchor, label);
					};

					$.if(node_5, ($$render) => {
						if ($.get(field).label) $$render(consequent_3);
					});
				}

				var node_6 = $.sibling(node_5, 2);

				{
					var consequent_4 = ($$anchor) => {
						var input = root_4();

						$.remove_input_defaults(input);

						$.template_effect(
							($0) => {
								$.set_attribute(input, 'id', $.get(field).id);
								$.set_attribute(input, 'name', $.get(field).id);
								$.set_attribute(input, 'type', $.get(field).inputType ?? "text");
								input.disabled = !editable();
								$.set_attribute(input, 'placeholder', $.get(field).placeholder ?? $.get(field).label ?? "");
								$.set_class(input, 1, `${$0 ?? ''} input-sm mt-1 input input-bordered w-full max-w-xs mb-3 text-base py-4`);

								$.set_value(input, $page().form
									? $page().form[$.get(field).id]
									: $.get(field).initialValue);

								$.set_attribute(input, 'maxlength', $.get(field).maxlength ? $.get(field).maxlength : null);
							},
							[
								() => fieldError($page()?.form, $.get(field).id) ? 'input-error' : ''
							]
						);

						$.append($$anchor, input);
					};

					var alternate = ($$anchor) => {
						var div_4 = root_5();
						var text_3 = $.only_child(div_4, true);

						$.template_effect(() => $.set_text(text_3, $.get(field).initialValue));
						$.append($$anchor, div_4);
					};

					$.if(node_6, ($$render) => {
						if (editable()) $$render(consequent_4); else $$render(alternate, -1);
					});
				}

				$.append($$anchor, fragment_1);
			});

			var node_7 = $.sibling(node_4, 2);

			{
				var consequent_5 = ($$anchor) => {
					var p = root_7();
					var text_4 = $.only_child(p, true);

					$.template_effect(() => $.set_text(text_4, $page()?.form?.errorMessage));
					$.append($$anchor, p);
				};

				$.if(node_7, ($$render) => {
					if ($page()?.form?.errorMessage) $$render(consequent_5);
				});
			}

			var node_8 = $.sibling(node_7, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_5 = root_9();
					var button = $.child(div_5);
					var node_9 = $.child(button);

					{
						var consequent_6 = ($$anchor) => {
							var span_2 = root_8();

							$.append($$anchor, span_2);
						};

						var alternate_1 = ($$anchor) => {
							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, saveButtonTitle()));
							$.append($$anchor, text_5);
						};

						$.if(node_9, ($$render) => {
							if ($.get(loading)) $$render(consequent_6); else $$render(alternate_1, -1);
						});
					}

					$.reset(button);
					$.reset(div_5);

					$.template_effect(() => {
						$.set_class(button, 1, `ml-auto btn btn-sm mt-3 min-w-[145px] ${dangerous() ? 'btn-error' : 'btn-primary btn-outline'}`);
						button.disabled = $.get(loading);
					});

					$.append($$anchor, div_5);
				};

				var consequent_8 = ($$anchor) => {
					var a = root_10();
					var button_1 = $.child(a);
					var text_6 = $.only_child(button_1, true);

					$.reset(a);

					$.template_effect(() => {
						$.set_attribute(a, 'href', editLink());
						$.set_class(button_1, 1, `btn btn-outline btn-sm ${dangerous() ? 'btn-error' : ''} min-w-[145px]`);
						$.set_text(text_6, editButtonTitle());
					});

					$.append($$anchor, a);
				};

				$.if(node_8, ($$render) => {
					if (editable()) $$render(consequent_7); else if (editButtonTitle() && editLink()) $$render(consequent_8, 1);
				});
			}

			$.reset(form);
			$.action(form, ($$node, $$action_arg) => enhance?.($$node, $$action_arg), () => handleSubmit);
			$.template_effect(() => $.set_attribute(form, 'action', formTarget()));
			$.append($$anchor, fragment);
		};

		var alternate_2 = ($$anchor) => {
			var fragment_3 = root_12();
			var div_6 = $.first_child(fragment_3);
			var div_7 = $.child(div_6);
			var text_7 = $.only_child(div_7, true);
			var div_8 = $.sibling(div_7, 2);
			var text_8 = $.only_child(div_8, true);

			$.reset(div_6);
			$.next(2);

			$.template_effect(() => {
				$.set_text(text_7, successTitle());
				$.set_text(text_8, successBody());
			});

			$.append($$anchor, fragment_3);
		};

		$.if(node_1, ($$render) => {
			if (!$.get(showSuccess)) $$render(consequent_9); else $$render(alternate_2, -1);
		});
	}

	$.reset(div_2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}