import type * as Monaco from 'monaco-editor';

export const SVELTE_LANGUAGE_ID = 'svelte';

export const svelteLanguageConfiguration: Monaco.languages.LanguageConfiguration = {
	comments: {
		blockComment: ['<!--', '-->']
	},
	brackets: [
		['{', '}'],
		['[', ']'],
		['(', ')'],
		['<', '>']
	],
	autoClosingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: "'", close: "'", notIn: ['string', 'comment'] },
		{ open: '"', close: '"', notIn: ['string'] },
		{ open: '`', close: '`', notIn: ['string', 'comment'] },
		{ open: '<!--', close: '-->', notIn: ['comment', 'string'] },
		{ open: '<', close: '>', notIn: ['string'] }
	],
	surroundingPairs: [
		{ open: '{', close: '}' },
		{ open: '[', close: ']' },
		{ open: '(', close: ')' },
		{ open: "'", close: "'" },
		{ open: '"', close: '"' },
		{ open: '`', close: '`' },
		{ open: '<', close: '>' }
	],
	folding: {
		markers: {
			start: /^\s*<!--\s*#region\b.*-->/,
			end: /^\s*<!--\s*#endregion\b.*-->/
		}
	},
	wordPattern:
		/(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
};

export const svelteTokensProvider: Monaco.languages.IMonarchLanguage = {
	defaultToken: '',
	tokenPostfix: '.svelte',
	ignoreCase: true,

	// Character classes
	brackets: [
		{ token: 'delimiter.curly', open: '{', close: '}' },
		{ token: 'delimiter.parenthesis', open: '(', close: ')' },
		{ token: 'delimiter.square', open: '[', close: ']' },
		{ token: 'delimiter.angle', open: '<', close: '>' }
	],

	keywords: [
		'if',
		'else',
		'each',
		'await',
		'then',
		'catch',
		'key',
		'snippet',
		'render',
		'html',
		'debug',
		'const'
	],

	// Svelte special syntax
	svelteKeywords: ['$state', '$derived', '$effect', '$props', '$bindable', '$inspect', '$host'],

	jsKeywords: [
		'break',
		'case',
		'catch',
		'continue',
		'debugger',
		'default',
		'delete',
		'do',
		'else',
		'finally',
		'for',
		'function',
		'if',
		'in',
		'instanceof',
		'new',
		'return',
		'switch',
		'this',
		'throw',
		'try',
		'typeof',
		'var',
		'void',
		'while',
		'with',
		'class',
		'const',
		'enum',
		'export',
		'extends',
		'import',
		'super',
		'implements',
		'interface',
		'let',
		'package',
		'private',
		'protected',
		'public',
		'static',
		'yield',
		'async',
		'await',
		'of'
	],

	typeKeywords: ['any', 'boolean', 'number', 'object', 'string', 'undefined'],

	operators: [
		'=',
		'>',
		'<',
		'!',
		'~',
		'?',
		':',
		'==',
		'<=',
		'>=',
		'!=',
		'&&',
		'||',
		'++',
		'--',
		'+',
		'-',
		'*',
		'/',
		'&',
		'|',
		'^',
		'%',
		'<<',
		'>>',
		'>>>',
		'+=',
		'-=',
		'*=',
		'/=',
		'&=',
		'|=',
		'^=',
		'%=',
		'<<=',
		'>>=',
		'>>>='
	],

	symbols: /[=><!~?:&|+\-*\/\^%]+/,
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

	// Main tokenizer
	tokenizer: {
		root: [
			// Svelte logic blocks
			[/\{#(if|each|await|key|snippet)\b/, { token: 'keyword.svelte', next: '@svelteBlock' }],
			[/\{:(else|then|catch)\b/, { token: 'keyword.svelte', next: '@svelteBlock' }],
			[/\{\/(if|each|await|key|snippet)\}/, 'keyword.svelte'],
			[/\{@(html|debug|const|render)\b/, { token: 'keyword.svelte', next: '@svelteBlock' }],

			// Svelte expressions
			[/\{/, { token: 'delimiter.curly', next: '@svelteExpression' }],

			// Script and style tags
			[/<script(\s+[^>]*)?>/, { token: 'tag', next: '@script' }],
			[/<style(\s+[^>]*)?>/, { token: 'tag', next: '@style' }],

			// HTML comments
			[/<!--/, { token: 'comment.html', next: '@htmlComment' }],

			// HTML tags
			[/<\/?[\w:-]+/, { token: 'tag', next: '@htmlTag' }],

			// Text
			[/[^<{]+/, 'text']
		],

		svelteBlock: [[/\}/, { token: 'keyword.svelte', next: '@pop' }], { include: '@jsExpression' }],

		svelteExpression: [
			[/\}/, { token: 'delimiter.curly', next: '@pop' }],
			{ include: '@jsExpression' }
		],

		jsExpression: [
			// Svelte runes
			[/\$(?:state|derived|effect|props|bindable|inspect|host)\b/, 'keyword.svelte.rune'],
			// Keywords
			[
				/[a-zA-Z_$][\w$]*/,
				{
					cases: {
						'@jsKeywords': 'keyword.js',
						'@typeKeywords': 'keyword.type',
						'@default': 'identifier'
					}
				}
			],
			// Strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'],
			[/'([^'\\]|\\.)*$/, 'string.invalid'],
			[/"/, 'string', '@stringDouble'],
			[/'/, 'string', '@stringSingle'],
			[/`/, 'string', '@stringTemplate'],
			// Numbers
			[/\d+\.\d*([eE][\-+]?\d+)?/, 'number.float'],
			[/\.\d+([eE][\-+]?\d+)?/, 'number.float'],
			[/\d+[eE][\-+]?\d+/, 'number.float'],
			[/0[xX][0-9a-fA-F]+/, 'number.hex'],
			[/0[bB][01]+/, 'number.binary'],
			[/0[oO][0-7]+/, 'number.octal'],
			[/\d+/, 'number'],
			// Operators
			[/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
			// Delimiters
			[/[{}()\[\]]/, '@brackets'],
			[/[;,.]/, 'delimiter'],
			// Whitespace
			[/\s+/, 'white']
		],

		stringDouble: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'string', '@pop']
		],

		stringSingle: [
			[/[^\\']+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/'/, 'string', '@pop']
		],

		stringTemplate: [
			[/\$\{/, { token: 'delimiter.bracket', next: '@templateExpression' }],
			[/[^\\`$]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/`/, 'string', '@pop']
		],

		templateExpression: [
			[/\}/, { token: 'delimiter.bracket', next: '@pop' }],
			{ include: '@jsExpression' }
		],

		htmlTag: [
			// Svelte directives
			[/(on|bind|class|style|use|transition|in|out|animate|let):/, 'attribute.name.svelte'],
			// Attribute names
			[/[\w:-]+/, 'attribute.name'],
			// Attribute values with Svelte expressions
			[/=\{/, { token: 'delimiter', next: '@attributeExpression' }],
			// Attribute values
			[/=/, 'delimiter', '@attributeValue'],
			// Tag close
			[/\/?>/, 'tag', '@pop'],
			// Whitespace
			[/\s+/, 'white']
		],

		attributeExpression: [
			[/\}/, { token: 'delimiter', next: '@pop' }],
			{ include: '@jsExpression' }
		],

		attributeValue: [
			[/"[^"]*"/, 'attribute.value', '@pop'],
			[/'[^']*'/, 'attribute.value', '@pop'],
			[/\{/, { token: 'delimiter', switchTo: '@attributeExpression' }],
			[/[^\s>]+/, 'attribute.value', '@pop']
		],

		htmlComment: [
			[/-->/, 'comment.html', '@pop'],
			[/./, 'comment.html']
		],

		script: [[/<\/script\s*>/, { token: 'tag', next: '@pop' }], { include: '@jsExpression' }],

		style: [
			[/<\/style\s*>/, { token: 'tag', next: '@pop' }],
			[/\/\*/, { token: 'comment.css', next: '@cssComment' }],
			[/\{/, { token: 'delimiter.curly', next: '@cssBlock' }],
			{ include: '@cssSelector' }
		],

		cssSelector: [
			[/@[\w-]+/, 'keyword.css'],
			[/\.[\w-]+/, 'attribute.name.css.class'],
			[/#[\w-]+/, 'attribute.name.css.id'],
			[/&/, 'keyword.css'],
			[/::?[\w-]+/, 'attribute.name.css.pseudo'],
			[/\[[^\]]*\]/, 'attribute.value.css'],
			[/[\w-]+/, 'tag.css'],
			[/[>+~,]/, 'operator.css'],
			[/\*/, 'operator.css'],
			[/[()]/, 'delimiter.parenthesis'],
			[/"/, 'string', '@stringDouble'],
			[/'/, 'string', '@stringSingle'],
			[/\s+/, 'white'],
			[/./, '']
		],

		cssBlock: [
			[/\}/, { token: 'delimiter.curly', next: '@pop' }],
			[/\/\*/, { token: 'comment.css', next: '@cssComment' }],
			// nested rule: a selector followed by `{` (basic detection for `&:hover {` etc.)
			[/(&[^;{}]*?)(\{)/, ['attribute.name.css.pseudo', { token: 'delimiter.curly', next: '@cssBlock' }]],
			// property name followed by colon → switch to value state
			[/([\w-]+)(\s*)(:)/, ['attribute.name.css', 'white', { token: 'delimiter', next: '@cssValue' }]],
			[/;/, 'delimiter'],
			[/\s+/, 'white'],
			[/./, '']
		],

		cssValue: [
			[/;/, { token: 'delimiter', next: '@pop' }],
			[/(?=\})/, { token: '', next: '@pop' }],
			[/\/\*/, { token: 'comment.css', next: '@cssComment' }],
			[/"/, 'string', '@stringDouble'],
			[/'/, 'string', '@stringSingle'],
			[/!important\b/, 'keyword.css'],
			[/#[0-9a-fA-F]{3,8}\b/, 'number.hex'],
			[/[+-]?\d*\.\d+(?:[a-zA-Z%]+)?/, 'number.float'],
			[/[+-]?\d+(?:[a-zA-Z%]+)?/, 'number'],
			[/url\b/, 'keyword.css'],
			[/[\w-]+(?=\s*\()/, 'attribute.value.css.function'],
			[/[\w-]+/, 'attribute.value.css'],
			[/[()]/, 'delimiter.parenthesis'],
			[/,/, 'delimiter'],
			[/[/*+]/, 'operator.css'],
			[/\s+/, 'white'],
			[/./, '']
		],

		cssComment: [
			[/\*\//, { token: 'comment.css', next: '@pop' }],
			[/./, 'comment.css']
		]
	}
};

// Light theme tuned to the rsvelte site palette: paper-white background,
// rust/svelte-orange accents on Svelte-specific tokens.
export const svelteLightTheme: Monaco.editor.IStandaloneThemeData = {
	base: 'vs',
	inherit: true,
	rules: [
		{ token: 'keyword.svelte', foreground: 'B7410E', fontStyle: 'bold' },
		{ token: 'keyword.svelte.rune', foreground: 'FF3E00', fontStyle: 'bold' },
		{ token: 'keyword.css', foreground: 'B7410E', fontStyle: 'bold' },
		{ token: 'tag', foreground: '2A2722' },
		{ token: 'tag.css', foreground: '5A3A8A' },
		{ token: 'attribute.name', foreground: '14130F' },
		{ token: 'attribute.name.svelte', foreground: 'B7410E' },
		{ token: 'attribute.name.css', foreground: '1D5D4A' },
		{ token: 'attribute.name.css.class', foreground: 'B7410E' },
		{ token: 'attribute.name.css.id', foreground: 'B7410E' },
		{ token: 'attribute.name.css.pseudo', foreground: 'FF3E00', fontStyle: 'italic' },
		{ token: 'attribute.value', foreground: '7A4520' },
		{ token: 'attribute.value.css', foreground: '7A4520' },
		{ token: 'attribute.value.css.function', foreground: '5A3A8A' },
		{ token: 'operator.css', foreground: '6E6A60' },
		{ token: 'delimiter.curly', foreground: '6E6A60' },
		{ token: 'delimiter.parenthesis', foreground: '6E6A60' },
		{ token: 'delimiter.square', foreground: '6E6A60' },
		{ token: 'delimiter.angle', foreground: '6E6A60' },
		{ token: 'delimiter', foreground: '6E6A60' },
		{ token: 'keyword.js', foreground: '5A3A8A' },
		{ token: 'keyword.type', foreground: '1D5D4A' },
		{ token: 'string', foreground: '7A4520' },
		{ token: 'string.escape', foreground: 'B7410E' },
		{ token: 'number', foreground: '2E5A3A' },
		{ token: 'number.float', foreground: '2E5A3A' },
		{ token: 'number.hex', foreground: '2E5A3A' },
		{ token: 'comment', foreground: '97938A', fontStyle: 'italic' },
		{ token: 'comment.html', foreground: '97938A', fontStyle: 'italic' },
		{ token: 'operator', foreground: '14130F' },
		{ token: 'identifier', foreground: '14130F' }
	],
	colors: {
		'editor.background': '#FBF9F2',
		'editor.foreground': '#14130F',
		'editor.lineHighlightBackground': '#F3F1E9',
		'editor.lineHighlightBorder': '#00000000',
		'editorLineNumber.foreground': '#B8B3A4',
		'editorLineNumber.activeForeground': '#6E6A60',
		'editor.selectionBackground': '#FF3E0033',
		'editor.inactiveSelectionBackground': '#14130F14',
		'editorCursor.foreground': '#FF3E00',
		'editorWhitespace.foreground': '#14130F14',
		'editorIndentGuide.background': '#14130F0F',
		'editorIndentGuide.activeBackground': '#14130F29',
		'editorBracketMatch.background': '#FF3E0020',
		'editorBracketMatch.border': '#FF3E0080',
		'scrollbar.shadow': '#00000000',
		'scrollbarSlider.background': '#14130F1A',
		'scrollbarSlider.hoverBackground': '#14130F33',
		'scrollbarSlider.activeBackground': '#14130F55',
		'editorGutter.background': '#FBF9F2',
		'editorWidget.background': '#F3F1E9',
		'editorWidget.border': '#D8D4C4',
		'editorSuggestWidget.background': '#F3F1E9',
		'editorSuggestWidget.border': '#D8D4C4',
		'editorSuggestWidget.foreground': '#14130F',
		'editorSuggestWidget.selectedBackground': '#FF3E0020',
		'editorSuggestWidget.highlightForeground': '#B7410E',
		'editorHoverWidget.background': '#F3F1E9',
		'editorHoverWidget.border': '#D8D4C4',
		'editorOverviewRuler.border': '#00000000'
	}
};

// Dark theme — same token map, darker surfaces tuned to the dark palette.
export const svelteDarkTheme: Monaco.editor.IStandaloneThemeData = {
	base: 'vs-dark',
	inherit: true,
	rules: [
		{ token: 'keyword.svelte', foreground: 'E58050', fontStyle: 'bold' },
		{ token: 'keyword.svelte.rune', foreground: 'FF6634', fontStyle: 'bold' },
		{ token: 'keyword.css', foreground: 'E58050', fontStyle: 'bold' },
		{ token: 'tag', foreground: 'C9C1AA' },
		{ token: 'tag.css', foreground: 'B19BE0' },
		{ token: 'attribute.name', foreground: 'F1ECDF' },
		{ token: 'attribute.name.svelte', foreground: 'E58050' },
		{ token: 'attribute.name.css', foreground: '6CC0A0' },
		{ token: 'attribute.name.css.class', foreground: 'E58050' },
		{ token: 'attribute.name.css.id', foreground: 'E58050' },
		{ token: 'attribute.name.css.pseudo', foreground: 'FF6634', fontStyle: 'italic' },
		{ token: 'attribute.value', foreground: 'D9A66E' },
		{ token: 'attribute.value.css', foreground: 'D9A66E' },
		{ token: 'attribute.value.css.function', foreground: 'B19BE0' },
		{ token: 'operator.css', foreground: '8A8472' },
		{ token: 'delimiter.curly', foreground: '8A8472' },
		{ token: 'delimiter.parenthesis', foreground: '8A8472' },
		{ token: 'delimiter.square', foreground: '8A8472' },
		{ token: 'delimiter.angle', foreground: '8A8472' },
		{ token: 'delimiter', foreground: '8A8472' },
		{ token: 'keyword.js', foreground: 'B19BE0' },
		{ token: 'keyword.type', foreground: '6CC0A0' },
		{ token: 'string', foreground: 'D9A66E' },
		{ token: 'string.escape', foreground: 'E58050' },
		{ token: 'number', foreground: '8CCC95' },
		{ token: 'number.float', foreground: '8CCC95' },
		{ token: 'number.hex', foreground: '8CCC95' },
		{ token: 'comment', foreground: '75705F', fontStyle: 'italic' },
		{ token: 'comment.html', foreground: '75705F', fontStyle: 'italic' },
		{ token: 'operator', foreground: 'F1ECDF' },
		{ token: 'identifier', foreground: 'F1ECDF' }
	],
	colors: {
		'editor.background': '#14110B',
		'editor.foreground': '#EFE9DA',
		'editor.lineHighlightBackground': '#1D1A13',
		'editor.lineHighlightBorder': '#00000000',
		'editorLineNumber.foreground': '#4F4A3D',
		'editorLineNumber.activeForeground': '#A09A87',
		'editor.selectionBackground': '#FF663433',
		'editor.inactiveSelectionBackground': '#EFE9DA14',
		'editorCursor.foreground': '#FF6634',
		'editorWhitespace.foreground': '#EFE9DA14',
		'editorIndentGuide.background': '#EFE9DA10',
		'editorIndentGuide.activeBackground': '#EFE9DA29',
		'editorBracketMatch.background': '#FF663425',
		'editorBracketMatch.border': '#FF663480',
		'scrollbar.shadow': '#00000000',
		'scrollbarSlider.background': '#EFE9DA1A',
		'scrollbarSlider.hoverBackground': '#EFE9DA33',
		'scrollbarSlider.activeBackground': '#EFE9DA55',
		'editorGutter.background': '#14110B',
		'editorWidget.background': '#1D1A13',
		'editorWidget.border': '#3A3528',
		'editorSuggestWidget.background': '#1D1A13',
		'editorSuggestWidget.border': '#3A3528',
		'editorSuggestWidget.foreground': '#EFE9DA',
		'editorSuggestWidget.selectedBackground': '#FF663425',
		'editorSuggestWidget.highlightForeground': '#FF6634',
		'editorHoverWidget.background': '#1D1A13',
		'editorHoverWidget.border': '#3A3528',
		'editorOverviewRuler.border': '#00000000'
	}
};

// Backwards-compat alias — the old name was 'svelte-cream'. We now have two
// themes; consumers should use SVELTE_THEME_LIGHT / SVELTE_THEME_DARK.
export const svelteCreamTheme = svelteLightTheme;
export const SVELTE_THEME_LIGHT = 'svelte-light';
export const SVELTE_THEME_DARK = 'svelte-dark';

export function registerSvelteLanguage(monaco: typeof Monaco): void {
	monaco.languages.register({ id: SVELTE_LANGUAGE_ID });
	monaco.languages.setLanguageConfiguration(SVELTE_LANGUAGE_ID, svelteLanguageConfiguration);
	monaco.languages.setMonarchTokensProvider(SVELTE_LANGUAGE_ID, svelteTokensProvider);
	monaco.editor.defineTheme(SVELTE_THEME_LIGHT, svelteLightTheme);
	monaco.editor.defineTheme(SVELTE_THEME_DARK, svelteDarkTheme);
}
