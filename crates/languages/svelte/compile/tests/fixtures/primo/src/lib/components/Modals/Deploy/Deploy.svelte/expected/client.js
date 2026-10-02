import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Icon from '@iconify/svelte';
import { page } from '$app/state';
import { onModKey } from '$lib/builder/utils/keyboard';
import { mod_key_held } from '$lib/builder/stores/app/misc';
import { instance } from '$lib/instance';

var root = $.from_html(`<p class="description svelte-cul2vq"> <a target="_blank" class="svelte-cul2vq"> </a></p>`);
var root_1 = $.from_html(`<p class="description svelte-cul2vq">Ready to preview your website changes?</p>`);
var root_2 = $.from_html(`<p class="description svelte-cul2vq">Ready to publish? This site has no domain yet — publish now, then connect a domain to make it public.</p>`);
var root_3 = $.from_html(`<span class="key-hint svelte-cul2vq">⌘P</span>`);
var root_4 = $.from_html(`<div class="container svelte-cul2vq"><h3 class="title svelte-cul2vq"> </h3> <!> <div class="buttons svelte-cul2vq"><button class="primo-button svelte-cul2vq"><span>Cancel</span></button> <button class="primo-button primary svelte-cul2vq"><!> <span> </span> <!></button></div></div>`);
var root_5 = $.from_html(` <a target="_blank" class="svelte-cul2vq"> </a>`, 1);
var root_6 = $.from_html(`<a target="_blank" class="primo-button svelte-cul2vq"><!> <span> </span></a>`);
var root_7 = $.from_html(`<button class="primo-button svelte-cul2vq"><!> <span>Connect a domain</span></button>`);
var root_8 = $.from_html(`<div class="container svelte-cul2vq"><h3 class="title svelte-cul2vq"> </h3> <p class="description svelte-cul2vq"><!></p> <div class="buttons svelte-cul2vq"><button class="primo-button primary svelte-cul2vq"><span>Done</span></button> <!></div></div>`);
var root_9 = $.from_html(`<div class="container svelte-cul2vq"><h3 class="title svelte-cul2vq">Publishing Failed</h3> <p class="error svelte-cul2vq"> </p> <div class="buttons svelte-cul2vq"><button class="primo-button svelte-cul2vq"><span>Close</span></button> <button class="primo-button primary svelte-cul2vq"><span>Try Again</span></button></div></div>`);
var root_10 = $.from_html(`<div class="Deploy primo-reset svelte-cul2vq"><!></div>`);

export default function Deploy($$anchor, $$props) {
	$.push($$props, true);

	const $mod_key_held = () => $.store_get(mod_key_held, '$mod_key_held', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let stage = $.prop($$props, 'stage', 15);
	let error = $.state(null);

	async function handle_publish() {
		try {
			$.set(error, null);
			await $$props.publish_fn();
			stage('PUBLISHED');
		} catch(err) {
			console.error('Publish error:', err);
			$.set(error, err.message || err.toString() || 'Failed to publish site', true);
			stage('ERROR');
		}
	}

	stage(stage() || 'INITIAL');

	// Set up hotkey listener for Cmd/Ctrl+P to confirm publish
	onModKey('p', () => {
		if (stage() === 'INITIAL' && !$$props.loading) {
			handle_publish();
		}
	});

	var div = root_10();
	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_4();
			var h3 = $.child(div_1);
			var text = $.only_child(h3, true);
			var node_1 = $.sibling(h3, 2);

			{
				var consequent = ($$anchor) => {
					var p = root();
					var text_1 = $.child(p);
					var a = $.sibling(text_1);
					var text_2 = $.only_child(a, true);

					$.reset(p);

					$.template_effect(() => {
						$.set_text(text_1, `${instance.dev_mode
							? 'Your website will be previewed at'
							: 'Your website will be published to'} `);

						$.set_attribute(a, 'href', `${page.url.protocol ?? ''}//${$$props.site_host ?? ''}`);
						$.set_text(text_2, $$props.site_host);
					});

					$.append($$anchor, p);
				};

				var consequent_1 = ($$anchor) => {
					var p_1 = root_1();

					$.append($$anchor, p_1);
				};

				var alternate = ($$anchor) => {
					var p_2 = root_2();

					$.append($$anchor, p_2);
				};

				$.if(node_1, ($$render) => {
					if ($$props.site_host) $$render(consequent); else if (instance.dev_mode) $$render(consequent_1, 1); else $$render(alternate, -1);
				});
			}

			var div_2 = $.sibling(node_1, 2);
			var button = $.child(div_2);
			var button_1 = $.sibling(button, 2);
			var node_2 = $.child(button_1);

			{
				let $0 = $.derived(() => $$props.loading
					? 'line-md:loading-twotone-loop'
					: instance.dev_mode ? 'lucide:eye' : 'entypo:publish');

				let $1 = $.derived(() => $mod_key_held() && !$$props.loading ? 'invisible' : '');

				Icon(node_2, {
					get icon() {
						return $.get($0);
					},

					get class() {
						return $.get($1);
					}
				});
			}

			var span = $.sibling(node_2, 2);
			let classes;
			var text_3 = $.only_child(span, true);
			var node_3 = $.sibling(span, 2);

			{
				var consequent_2 = ($$anchor) => {
					var span_1 = root_3();

					$.append($$anchor, span_1);
				};

				$.if(node_3, ($$render) => {
					if ($mod_key_held() && !$$props.loading) $$render(consequent_2);
				});
			}

			$.reset(button_1);
			$.reset(div_2);
			$.reset(div_1);

			$.template_effect(() => {
				$.set_text(text, instance.dev_mode ? 'Preview Site' : 'Publish Site');
				button_1.disabled = $$props.loading;
				classes = $.set_class(span, 1, '', null, classes, { invisible: $mod_key_held() && !$$props.loading });

				$.set_text(text_3, $$props.loading
					? instance.dev_mode ? 'Building...' : 'Publishing...'
					: instance.dev_mode ? 'Build Preview' : 'Publish Changes');
			});

			$.delegated('click', button, function (...$$args) {
				$$props.onClose?.apply(this, $$args);
			});

			$.delegated('click', button_1, handle_publish);
			$.append($$anchor, div_1);
		};

		var consequent_8 = ($$anchor) => {
			var div_3 = root_8();
			var h3_1 = $.child(div_3);
			var text_4 = $.only_child(h3_1, true);
			var p_3 = $.sibling(h3_1, 2);
			var node_4 = $.child(p_3);

			{
				var consequent_4 = ($$anchor) => {
					var fragment = root_5();
					var text_5 = $.first_child(fragment);
					var a_1 = $.sibling(text_5);
					var text_6 = $.only_child(a_1, true);

					$.template_effect(() => {
						$.set_text(text_5, `${instance.dev_mode
							? 'Your website preview is ready at'
							: 'Your website changes have been published to'} `);

						$.set_attribute(a_1, 'href', `${page.url.protocol ?? ''}//${$$props.site_host ?? ''}`);
						$.set_text(text_6, $$props.site_host);
					});

					$.append($$anchor, fragment);
				};

				var consequent_5 = ($$anchor) => {
					var text_7 = $.text('Your website preview is ready on your local server.');

					$.append($$anchor, text_7);
				};

				var alternate_1 = ($$anchor) => {
					var text_8 = $.text('Your changes are published. Connect a domain to make this site public.');

					$.append($$anchor, text_8);
				};

				$.if(node_4, ($$render) => {
					if ($$props.site_host) $$render(consequent_4); else if (instance.dev_mode) $$render(consequent_5, 1); else $$render(alternate_1, -1);
				});
			}

			$.reset(p_3);

			var div_4 = $.sibling(p_3, 2);
			var button_2 = $.child(div_4);
			var node_5 = $.sibling(button_2, 2);

			{
				var consequent_6 = ($$anchor) => {
					var a_2 = root_6();
					var node_6 = $.child(a_2);

					Icon(node_6, { icon: 'lucide:external-link' });

					var span_2 = $.sibling(node_6, 2);
					var text_9 = $.only_child(span_2, true);

					$.reset(a_2);

					$.template_effect(() => {
						$.set_attribute(a_2, 'href', `${page.url.protocol ?? ''}//${$$props.site_host ?? ''}`);
						$.set_text(text_9, instance.dev_mode ? 'View Preview' : 'View Site');
					});

					$.append($$anchor, a_2);
				};

				var consequent_7 = ($$anchor) => {
					var button_3 = root_7();
					var node_7 = $.child(button_3);

					Icon(node_7, { icon: 'lucide:globe' });
					$.next(2);
					$.reset(button_3);

					$.delegated('click', button_3, function (...$$args) {
						$$props.onConnectDomain?.apply(this, $$args);
					});

					$.append($$anchor, button_3);
				};

				$.if(node_5, ($$render) => {
					if ($$props.site_host) $$render(consequent_6); else if (!instance.dev_mode && $$props.onConnectDomain) $$render(consequent_7, 1);
				});
			}

			$.reset(div_4);
			$.reset(div_3);
			$.template_effect(() => $.set_text(text_4, instance.dev_mode ? 'Preview Ready!' : 'Published Successfully!'));

			$.delegated('click', button_2, function (...$$args) {
				$$props.onClose?.apply(this, $$args);
			});

			$.append($$anchor, div_3);
		};

		var consequent_9 = ($$anchor) => {
			var div_5 = root_9();
			var p_4 = $.sibling($.child(div_5), 2);
			var text_10 = $.only_child(p_4, true);
			var div_6 = $.sibling(p_4, 2);
			var button_4 = $.child(div_6);
			var button_5 = $.sibling(button_4, 2);

			$.reset(div_6);
			$.reset(div_5);
			$.template_effect(() => $.set_text(text_10, $.get(error)));

			$.delegated('click', button_4, function (...$$args) {
				$$props.onClose?.apply(this, $$args);
			});

			$.delegated('click', button_5, () => stage('INITIAL'));
			$.append($$anchor, div_5);
		};

		$.if(node, ($$render) => {
			if (stage() === 'INITIAL') $$render(consequent_3); else if (stage() === 'PUBLISHED') $$render(consequent_8, 1); else if (stage() === 'ERROR') $$render(consequent_9, 2);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);