// The DOM both runtimes render into, and the normalized view of it a trace records: what a user
// sees, and nothing that is an implementation artifact of one runtime. Rules, each with its reason
// (docs/fixtures.md §12 lists them for readers):
//   - comments are dropped: Svelte's `<!---->` / `<!--[-->` anchors and Vue's `<!--[-->` /
//     `<!--]-->` / `<!--v-if-->` fragment markers render nothing; text around a dropped comment
//     joins, as it does on screen;
//   - `data-v-<hash>` attributes (Vue scoped CSS) and `svelte-<hash>` classes (Svelte scoped CSS)
//     are dropped: each scopes the component's own styles; browser cases check computed styles;
//   - attributes are sorted by name; class tokens are deduplicated and sorted; `style` is reparsed
//     into sorted `property: value` declarations (CSS reads none of these orders);
//   - style element text uses parsed CSS rules so formatting alone does not differ;
//   - text follows CSS `white-space: normal`: runs of whitespace become one space, and a space at a
//     block boundary (the edge of a block-level parent, or beside a block-level sibling or `<br>`)
//     is dropped, because it renders nothing there. A space between inline content stays, so
//     `<b>a</b> <b>b</b>` and `<b>a</b><b>b</b>` stay different, as they look different. Inside
//     `<pre>` text is kept verbatim. An inline parent's edge is not treated as a boundary, which
//     can only report a difference that is invisible, never hide a visible one;
//   - form controls record the properties `v-model` and `bind:` write, which attributes do not
//     show: `.value` of `<input>` (other than checkbox and radio), `<textarea>` and `<select>`,
//     `.checked` of checkbox and radio, `.selected` of `<option>`. A `<textarea>`'s children are
//     its initial value only, so `.value` replaces them.
import { JSDOM } from 'jsdom';

let parser: Document | undefined;

function stylesheet(text: string): string {
	parser ??= new JSDOM('<!doctype html><html><body></body></html>').window
		.document;
	const style = parser.createElement('style');
	style.textContent = text;
	parser.head.appendChild(style);
	try {
		if (!style.sheet)
			throw new Error('could not parse CSS for a behaviour trace');
		return Array.from(style.sheet.cssRules, (rule) => rule.cssText).join('\n');
	} finally {
		style.remove();
	}
}

const BLOCK = new Set([
	'address',
	'article',
	'aside',
	'blockquote',
	'br',
	'caption',
	'dd',
	'details',
	'dialog',
	'div',
	'dl',
	'dt',
	'fieldset',
	'figcaption',
	'figure',
	'footer',
	'form',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'header',
	'hgroup',
	'hr',
	'li',
	'main',
	'nav',
	'ol',
	'optgroup',
	'option',
	'p',
	'pre',
	'section',
	'select',
	'summary',
	'table',
	'tbody',
	'td',
	'tfoot',
	'th',
	'thead',
	'tr',
	'ul',
]);
const isBlock = (n: Node | undefined): boolean =>
	n !== undefined && n.nodeType === 1 && BLOCK.has((n as Element).localName);

const quote = (s: string): string => JSON.stringify(s);

function attributes(el: Element): string[] {
	const out: [string, string][] = [];
	for (const a of Array.from(el.attributes)) {
		if (/^data-v-[0-9a-f]+$/.test(a.name)) continue;
		let value = a.value;
		if (a.name === 'class') {
			const tokens = [
				...new Set(
					value
						.split(/[ \t\n\f\r]+/)
						.filter((t) => t && !/^svelte-[a-z0-9]+$/.test(t)),
				),
			].sort();
			if (tokens.length === 0) continue;
			value = tokens.join(' ');
		} else if (a.name === 'style') {
			const style = (el as HTMLElement).style;
			const decls: string[] = [];
			for (let i = 0; i < style.length; i++) {
				const name = style.item(i);
				const priority = style.getPropertyPriority(name);
				decls.push(
					`${name}: ${style.getPropertyValue(name)}${priority ? ` !${priority}` : ''}`,
				);
			}
			if (decls.length === 0) continue;
			value = decls.sort().join('; ');
		}
		out.push([a.name, value]);
	}
	return out
		.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
		.map(([n, v]) => `${n}=${quote(v)}`);
}

function properties(el: Element): string[] {
	switch (el.localName) {
		case 'input': {
			const input = el as HTMLInputElement;
			return input.type === 'checkbox' || input.type === 'radio'
				? [`.checked=${input.checked}`]
				: [`.value=${quote(input.value)}`];
		}
		case 'textarea':
		case 'select':
			return [
				`.value=${quote((el as HTMLTextAreaElement | HTMLSelectElement).value)}`,
			];
		case 'option':
			return [`.selected=${(el as HTMLOptionElement).selected}`];
		default:
			return [];
	}
}

type Item = { el: Element } | { text: string };

/** Children with comments dropped and the text on either side of one joined. */
function items(parent: Node): Item[] {
	const out: Item[] = [];
	for (const n of Array.from(parent.childNodes)) {
		if (n.nodeType === 1) out.push({ el: n as Element });
		else if (n.nodeType === 3) {
			const last = out.at(-1);
			if (last && 'text' in last) last.text += n.nodeValue ?? '';
			else out.push({ text: n.nodeValue ?? '' });
		}
	}
	return out;
}

function children(
	parent: Element,
	depth: number,
	pre: boolean,
	lines: string[],
): void {
	if (parent.localName === 'textarea') return;
	const list = items(
		parent.localName === 'template' &&
			parent.namespaceURI === 'http://www.w3.org/1999/xhtml'
			? (parent as HTMLTemplateElement).content
			: parent,
	);
	const pad = '  '.repeat(depth);
	list.forEach((item, i) => {
		if ('el' in item) {
			element(item.el, depth, pre, lines);
			return;
		}
		let text = item.text;
		if (!pre) {
			text = text.replace(/[ \t\n\f\r]+/g, ' ');
			const prev = list[i - 1];
			const next = list[i + 1];
			if (prev ? isBlock((prev as { el: Element }).el) : isBlock(parent))
				text = text.replace(/^ /, '');
			if (next ? isBlock((next as { el: Element }).el) : isBlock(parent))
				text = text.replace(/ $/, '');
		}
		if (text) lines.push(pad + quote(text));
	});
}

function element(
	el: Element,
	depth: number,
	pre: boolean,
	lines: string[],
): void {
	const head = [el.localName, ...attributes(el), ...properties(el)].join(' ');
	const pad = '  '.repeat(depth);
	const inner: string[] = [];
	if (el.localName === 'style')
		inner.push(`${pad}  ${quote(stylesheet(el.textContent ?? ''))}`);
	else children(el, depth + 1, pre || el.localName === 'pre', inner);
	if (inner.length === 0) lines.push(`${pad}<${head}>`);
	else lines.push(`${pad}<${head}>`, ...inner, `${pad}</${el.localName}>`);
}

/** The normalized view of `root`'s content, one line per element or text run. */
export function serialize(root: Element): string[] {
	const lines: string[] = [];
	children(root, 0, false, lines);
	return lines;
}

/** Server-rendered HTML, parsed as a browser parses it into a block container, then normalized like the live DOM. */
export function serializeHtml(html: string): string[] {
	parser ??= new JSDOM('<!doctype html><html><body></body></html>').window
		.document;
	const div = parser.createElement('div');
	div.innerHTML = html;
	return serialize(div);
}
