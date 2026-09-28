import * as $ from 'svelte/internal/server';
import UI from '../../ui';
import Button from '$lib/builder/ui/Button.svelte';

export default function VideoModal($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const defaultValue = { url: '' };
		let { value = defaultValue, onsave } = $$props;

		if (typeof value === 'string' || !value) {
			value = defaultValue;
		}

		let videoURL = value.url || '';
		let video_id = void 0;
		let loading = false;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div><div class="VideoModal svelte-blkp1u">`);

			if (loading) {
				$$renderer.push('<!--[0-->');

				if (UI.Spinner) {
					$$renderer.push('<!--[-->');
					UI.Spinner($$renderer, {});
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else if (value.url) {
				$$renderer.push(`<!--[1--><div class="image-preview svelte-blkp1u"><iframe style="position: absolute; inset: 0; height: 100%; width: 100%;"${$.attr('src', `https://www.youtube.com/embed/${$.stringify(video_id)}`)} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen=""></iframe></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <form><div class="inputs svelte-blkp1u">`);

			if (UI.TextInput) {
				$$renderer.push('<!--[-->');

				UI.TextInput($$renderer, {
					label: 'Youtube Video URL',
					type: 'url',
					autofocus: true,
					oninput: (text) => {
						videoURL = text;
					},

					get value() {
						return value.url;
					},

					set value($$value) {
						value.url = $$value;
						$$settled = false;
					}
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> <footer class="svelte-blkp1u">`);
			Button($$renderer, { type: 'submit', label: 'Add Video' });
			$$renderer.push(`<!----></footer></form></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}