import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div><!></div>`);

export default function ToastMessage($$anchor, $$props) {
	$.push($$props, true);

	var div = root();

	$.attribute_effect(div, () => ({ class: '_sft-message', ...$$props.toast.ariaProps }), void 0, void 0, void 0, 'svelte-1g19uu6');

	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var text = $.text();

			$.template_effect(() => $.set_text(text, $$props.toast.message));
			$.append($$anchor, text);
		};

		var alternate = ($$anchor) => {
			const Message = $.derived(() => $$props.toast.message);
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.component(node_1, () => $.get(Message), ($$anchor, Message_1) => {
				Message_1($$anchor, $.spread_props(
					{
						get toast() {
							return $$props.toast;
						}
					},
					() => $$props.toast.props
				));
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.toast.message === 'string') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}