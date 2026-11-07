import * as $ from 'svelte/internal/server';
import Icon from '@iconify/svelte';
import { fly } from 'svelte/transition';
import * as _ from 'lodash-es';
import { locale } from '../../stores/app/misc';
import { add_language, delete_language, set_language } from '$lib/builder/actions';
import { locales as available_languages } from '../../constants';
import { entries } from '../../stores/data/site';

export default function LocaleSelector($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		/**
		 * @typedef {Object} Props
		 * @property {string} [align]
		 */
		/** @type {Props} */
		let { align = 'right' } = $$props;

		const Language_Name = (language) => _.find(available_languages, ['key', language])['name'];
		let showingSelector = false;
		let addingLanguage = false;

		let site_languages = $.derived(() => $.store_get($$store_subs ??= {}, '$entries', entries)
			? Object.keys($.store_get($$store_subs ??= {}, '$entries', entries))
			: []);

		let searchText = '';

		let filtered_available_languages = $.derived(() => ((text) => {
			return text.length > 0
				? available_languages.filter((l) => !site_languages().includes(l.key)).filter(match)
				: available_languages;

			function match(language) {
				let matching_language;

				try {
					matching_language = language.key.match(text.toLowerCase()) || language.name.toLowerCase().match(text.toLowerCase());
				} catch(e) {
					matching_language = false;
				}

				return matching_language;
			}
		})(searchText));

		$$renderer.push(`<div id="language-selector"${$.attr_class('svelte-c3hsoj', void 0, {
			'left': // Reset when closing
			align === 'left'
		})}><button${$.attr_class('label svelte-c3hsoj', void 0, { 'active': showingSelector })}><svg width="13" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 0.5C3.58065 0.5 0 4.08065 0 8.5C0 12.9194 3.58065 16.5 8 16.5C12.4194 16.5 16 12.9194 16 8.5C16 4.08065 12.4194 0.5 8 0.5ZM14.2323 5.40323H11.571C11.2806 3.97097 10.7935 2.75161 10.1774 1.88387C11.9516 2.47097 13.4097 3.75161 14.2323 5.40323ZM10.8387 8.5C10.8387 9.23871 10.7871 9.92581 10.7 10.5645H5.3C5.2129 9.92581 5.16129 9.23871 5.16129 8.5C5.16129 7.76129 5.2129 7.07419 5.3 6.43548H10.7C10.7871 7.07419 10.8387 7.76129 10.8387 8.5ZM8 1.53226C8.86774 1.53226 9.98065 2.95484 10.5194 5.40323H5.48064C6.01935 2.95484 7.13226 1.53226 8 1.53226ZM5.82258 1.88387C5.20968 2.74839 4.71935 3.96774 4.42903 5.40323H1.76774C2.59032 3.75161 4.04839 2.47097 5.82258 1.88387ZM1.03226 8.5C1.03226 7.78064 1.14194 7.0871 1.34516 6.43548H4.26452C4.18064 7.09677 4.12903 7.78387 4.12903 8.5C4.12903 9.21613 4.17742 9.90323 4.26452 10.5645H1.34516C1.14194 9.9129 1.03226 9.21935 1.03226 8.5ZM1.76774 11.5968H4.42903C4.71935 13.029 5.20645 14.2484 5.82258 15.1161C4.04839 14.529 2.59032 13.2484 1.76774 11.5968ZM8 15.4677C7.13226 15.4677 6.01935 14.0452 5.48064 11.5968H10.5194C9.98065 14.0452 8.86774 15.4677 8 15.4677ZM10.1774 15.1161C10.7903 14.2516 11.2806 13.0323 11.571 11.5968H14.2323C13.4097 13.2484 11.9516 14.529 10.1774 15.1161ZM11.7355 10.5645C11.8194 9.90323 11.871 9.21613 11.871 8.5C11.871 7.78387 11.8226 7.09677 11.7355 6.43548H14.6548C14.8581 7.0871 14.9677 7.78064 14.9677 8.5C14.9677 9.21935 14.8581 9.9129 14.6548 10.5645H11.7355Z" fill="white"></path></svg> <span>${$.escape($.store_get($$store_subs ??= {}, '$locale', locale).toUpperCase())}</span> <svg id="chevron" width="10" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="svelte-c3hsoj"><path d="M0.163372 4.73321L0.693703 4.20288C0.81922 4.07737 1.02274 4.07737 1.14828 4.20288L5.99995 9.04303L10.8516 4.20291C10.9772 4.07739 11.1807 4.07739 11.3062 4.20291L11.8366 4.73324C11.9621 4.85876 11.9621 5.06228 11.8366 5.18782L6.22723 10.7971C6.10171 10.9226 5.89819 10.9226 5.77265 10.7971L0.163372 5.1878C0.0378277 5.06225 0.0378277 4.85873 0.163372 4.73321Z" fill="white"></path></svg></button> `);

		if (showingSelector) {
			$$renderer.push(`<!--[0--><div class="select-container svelte-c3hsoj">`);

			if (!addingLanguage) {
				$$renderer.push(`<!--[0--><div class="language-list svelte-c3hsoj" aria-hidden="true"><!--[-->`);

				const each_array = $.ensure_array_like(site_languages().sort((l) => l === 'en' ? -1 : 1));

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let languageID = each_array[$$index];

					$$renderer.push(`<div class="language-item svelte-c3hsoj"><button${$.attr_class('option svelte-c3hsoj', void 0, {
						'active': languageID === $.store_get($$store_subs ??= {}, '$locale', locale)
					})}>${$.escape(Language_Name(languageID))} (${$.escape(languageID)})</button> `);

					if (languageID !== 'en') {
						$$renderer.push(`<!--[0--><button class="remove svelte-c3hsoj">`);
						Icon($$renderer, { icon: 'bi:x' });
						$$renderer.push(`<!----></button>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div>`);
				}

				$$renderer.push(`<!--]--> <button class="option svelte-c3hsoj">+ add new language</button></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="search-container"><div class="search svelte-c3hsoj"><svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9174 11.4893L9.07221 8.64413C9.01831 8.59023 8.948 8.56211 8.873 8.56211H8.56364C9.30189 7.70668 9.74952 6.59345 9.74952 5.37476C9.74952 2.68192 7.5676 0.5 4.87476 0.5C2.18192 0.5 0 2.68192 0 5.37476C0 8.0676 2.18192 10.2495 4.87476 10.2495C6.09345 10.2495 7.20668 9.80189 8.06211 9.06364V9.373C8.06211 9.448 8.09257 9.51831 8.14413 9.57221L10.9893 12.4174C11.0995 12.5275 11.2776 12.5275 11.3877 12.4174L11.9174 11.8877C12.0275 11.7776 12.0275 11.5995 11.9174 11.4893ZM4.87476 9.12458C2.80299 9.12458 1.12495 7.44654 1.12495 5.37476C1.12495 3.30299 2.80299 1.62495 4.87476 1.62495C6.94654 1.62495 8.62458 3.30299 8.62458 5.37476C8.62458 7.44654 6.94654 9.12458 4.87476 9.12458Z" fill="white"></path></svg> <input autofocus="" type="text"${$.attr('value', searchText)} class="svelte-c3hsoj"/></div> <div class="language-list svelte-c3hsoj"><!--[-->`);

				const each_array_1 = $.ensure_array_like(filtered_available_languages());

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let loc = each_array_1[$$index_1];

					$$renderer.push(`<button${$.attr_class('option svelte-c3hsoj', void 0, {
						'active': loc.key === $.store_get($$store_subs ??= {}, '$locale', locale)
					})}>${$.escape(loc.name)} (${$.escape(loc.key)})</button>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}