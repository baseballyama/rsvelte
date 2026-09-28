import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { WizardStep } from '$lib/layout';
import { app } from '$lib/stores/app';
import imgDark from '$lib/images/feedback/feedback-dark.svg';
import imgLight from '$lib/images/feedback/feedback-light.svg';

var root = $.from_html(`<img alt="" class="u-only-dark"/>`);
var root_1 = $.from_html(`<img alt="" class="u-only-light"/>`);
var root_2 = $.from_html(`<div class="u-flex u-main-center"><!></div>`);

export default function Step2($$anchor, $$props) {
	$.push($$props, true);

	const $app = () => $.store_get(app, '$app', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	WizardStep($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root_2();
			var node = $.child(div);

			{
				var consequent = ($$anchor) => {
					var img = root();

					$.template_effect(() => $.set_attribute(img, 'src', imgDark));
					$.append($$anchor, img);
				};

				var alternate = ($$anchor) => {
					var img_1 = root_1();

					$.template_effect(() => $.set_attribute(img_1, 'src', imgLight));
					$.append($$anchor, img_1);
				};

				$.if(node, ($$render) => {
					if ($app().themeInUse === 'dark') $$render(consequent); else $$render(alternate, -1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var text = $.text('Thank you');

				$.append($$anchor, text);
			}
		}
	});

	$.pop();
	$$cleanup();
}