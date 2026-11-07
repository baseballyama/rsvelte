import * as $ from 'svelte/internal/server';
import AutoLinkPluginCore from './AutoLinkPluginCore.svelte';

export default function AutoLinkPlugin($$renderer, $$props) {
	const { attributes } = $$props;

	function createLinkMatcherWithRegExp(regExp, urlTransformer = (text) => text) {
		return (text) => {
			const match = regExp.exec(text);

			if (match === null) {
				return null;
			}

			return {
				index: match.index,
				length: match[0].length,
				text: match[0],
				url: urlTransformer(match[0]),
				attributes
			};
		};
	}

	const URL_REGEX = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(?<![-.+():%])/;
	const EMAIL_REGEX = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

	const MATCHERS = [
		createLinkMatcherWithRegExp(URL_REGEX, (text) => {
			return text.startsWith('http') ? text : `https://${text}`;
		}),

		createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
			return `mailto:${text}`;
		})
	];

	AutoLinkPluginCore($$renderer, { matchers: MATCHERS });
	$.bind_props($$props, { createLinkMatcherWithRegExp });
}