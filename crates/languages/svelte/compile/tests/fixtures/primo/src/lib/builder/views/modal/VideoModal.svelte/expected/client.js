import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import UI from '../../ui';
import Button from '$lib/builder/ui/Button.svelte';

var root = $.from_html(`<div class="image-preview svelte-blkp1u"><iframe style="position: absolute;
				inset: 0;
				height: 100%;
				width: 100%;" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div>`);

var root_1 = $.from_html(`<div><div class="VideoModal svelte-blkp1u"><!> <form><div class="inputs svelte-blkp1u"><!></div> <footer class="svelte-blkp1u"><!></footer></form></div></div>`);

export default function VideoModal($$anchor, $$props) {
	$.push($$props, true);

	const defaultValue = { url: '' };
	let value = $.prop($$props, 'value', 31, () => $.proxy(defaultValue));

	if (typeof value() === 'string' || !value()) {
		value(defaultValue);
	}

	let videoURL = $.state($.proxy(value().url || ''));
	let video_id = $.state(void 0);
	let loading = false;

	$.user_effect(() => {
		if (value().url) {
			try {
				const url = new URL(value().url);
				const params = new URLSearchParams(url.search);

				$.set(video_id, params.get('v'), true);
			} catch(e) {}
		}
	});

	var div = root_1();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => UI.Spinner, ($$anchor, UI_Spinner) => {
				UI_Spinner($$anchor, {});
			});

			$.append($$anchor, fragment);
		};

		var consequent_1 = ($$anchor) => {
			var div_2 = root();
			var iframe = $.only_child(div_2);

			$.template_effect(() => $.set_attribute(iframe, 'src', `https://www.youtube.com/embed/${$.get(video_id) ?? ''}`));
			$.append($$anchor, div_2);
		};

		$.if(node, ($$render) => {
			if (loading) $$render(consequent); else if (value().url) $$render(consequent_1, 1);
		});
	}

	var form = $.sibling(node, 2);
	var div_3 = $.child(form);
	var node_2 = $.child(div_3);

	$.component(node_2, () => UI.TextInput, ($$anchor, UI_TextInput) => {
		UI_TextInput($$anchor, {
			label: 'Youtube Video URL',
			type: 'url',
			autofocus: true,
			oninput: (text) => {
				$.set(videoURL, text, true);
			},

			get value() {
				return value().url;
			},

			set value($$value) {
				value(value().url = $$value, true);
			}
		});
	});

	$.reset(div_3);

	var footer = $.sibling(div_3, 2);
	var node_3 = $.child(footer);

	Button(node_3, { type: 'submit', label: 'Add Video' });
	$.reset(footer);
	$.reset(form);
	$.reset(div_1);
	$.reset(div);

	$.event('submit', form, (e) => {
		e.preventDefault();
		$$props.onsave($.get(videoURL));
	});

	$.append($$anchor, div);
	$.pop();
}