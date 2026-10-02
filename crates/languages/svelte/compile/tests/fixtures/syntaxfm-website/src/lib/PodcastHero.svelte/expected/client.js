import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Header from '../routes/(site)/Header.svelte';
import Logo from './Logo.svelte';
import PodcastLinks from './PodcastLinks.svelte';
import Schedule from './schedule.svelte';

var root = $.from_html(`<section aria-label="Podcast Information Section" class="zone full layout svelte-zmz253"><!> <div class="hero svelte-zmz253"><div class="logo svelte-zmz253"><a href="/"><!></a></div> <h2 class="text-center svelte-zmz253"><span class="tasty svelte-zmz253">Tasty Treats</span> for Web Developers</h2> <p class="hosted-by svelte-zmz253"><span class="svelte-zmz253">With<wbr/></span> <span class="svelte-zmz253"><img width="50" height="50" alt="A rather handsome Wes Bos" class="svelte-zmz253"/><a href="/about">Wes Bos</a></span> <span class="amp svelte-zmz253">×</span> <span class="svelte-zmz253"><img width="50" height="50" alt="Scott lookin absolutely fresh" class="svelte-zmz253"/> <a href="/about">Scott Tolinski</a></span> <span class="amp svelte-zmz253">×</span> <span class="svelte-zmz253"><img width="50" height="50" alt="A very dapper CJ" class="svelte-zmz253"/> <a href="/about">CJ Reynolds</a></span></p> <p class="brought-by svelte-zmz253">Brought to you by <a href="https://sentry.io/welcome/?utm_medium=site&amp;utm_source=syntax&amp;utm_campaign=syntax-sentry-evergreen&amp;utm_content=homepage" target="_blank" title="Sentry" class="naked svelte-zmz253" aria-label="sentry"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 44" class="svelte-zmz253"><path d="M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z M124.32,28.28,109.56,9.22h-3.68V34.77h3.73V15.19l15.18,19.58h3.26V9.22h-3.73ZM87.15,23.54h13.23V20.22H87.14V12.53h14.93V9.21H83.34V34.77h18.92V31.45H87.14ZM71.59,20.3h0C66.44,19.06,65,18.08,65,15.7c0-2.14,1.89-3.59,4.71-3.59a12.06,12.06,0,0,1,7.07,2.55l2-2.83a14.1,14.1,0,0,0-9-3c-5.06,0-8.59,3-8.59,7.27,0,4.6,3,6.19,8.46,7.52C74.51,24.74,76,25.78,76,28.11s-2,3.77-5.09,3.77a12.34,12.34,0,0,1-8.3-3.26l-2.25,2.69a15.94,15.94,0,0,0,10.42,3.85c5.48,0,9-2.95,9-7.51C79.75,23.79,77.47,21.72,71.59,20.3ZM195.7,9.22l-7.69,12-7.64-12h-4.46L186,24.67V34.78h3.84V24.55L200,9.22Zm-64.63,3.46h8.37v22.1h3.84V12.68h8.37V9.22H131.08ZM169.41,24.8c3.86-1.07,6-3.77,6-7.63,0-4.91-3.59-8-9.38-8H154.67V34.76h3.8V25.58h6.45l6.48,9.2h4.44l-7-9.82Zm-10.95-2.5V12.6h7.17c3.74,0,5.88,1.77,5.88,4.84s-2.29,4.86-5.84,4.86Z" fill="#ffffff"></path></svg></a></p> <!> <!></div></section>`);

export default function PodcastHero($$anchor) {
	var section = root();

	$.set_style(section, '', {}, { '--bg': 'var(--black)', '--fg': 'var(--fg-1)' });

	var node = $.child(section);

	Header(node, { transparent: true });

	var div = $.sibling(node, 2);
	var div_1 = $.child(div);
	var a = $.child(div_1);
	var node_1 = $.child(a);

	Logo(node_1, {});
	$.reset(a);
	$.reset(div_1);

	var p = $.sibling(div_1, 4);
	var span = $.sibling($.child(p), 2);
	var img = $.child(span);

	$.set_attribute(img, 'src', `https://github.com/wesbos.png`);
	$.next();
	$.reset(span);

	var span_1 = $.sibling(span, 4);
	var img_1 = $.child(span_1);

	$.set_attribute(img_1, 'src', `https://github.com/stolinski.png`);
	$.next(2);
	$.reset(span_1);

	var span_2 = $.sibling(span_1, 4);
	var img_2 = $.child(span_2);

	$.set_attribute(img_2, 'src', `https://github.com/w3cj.png`);
	$.next(2);
	$.reset(span_2);
	$.reset(p);

	var node_2 = $.sibling(p, 4);

	PodcastLinks(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	Schedule(node_3, {});
	$.reset(div);
	$.reset(section);
	$.append($$anchor, section);
}