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

export const svelteCreamTheme: Monaco.editor.IStandaloneThemeData = {
	base: 'vs',
	inherit: true,
	rules: [
		{ token: 'keyword.svelte', foreground: 'C52F00', fontStyle: 'bold' },
		{ token: 'keyword.svelte.rune', foreground: 'FF3E00', fontStyle: 'bold' },
		{ token: 'keyword.css', foreground: 'C52F00', fontStyle: 'bold' },
		{ token: 'tag', foreground: '3A2A1A' },
		{ token: 'tag.css', foreground: '5A3A8A' },
		{ token: 'attribute.name', foreground: '1A1612' },
		{ token: 'attribute.name.svelte', foreground: 'C52F00' },
		{ token: 'attribute.name.css', foreground: '1D5D4A' },
		{ token: 'attribute.name.css.class', foreground: 'C52F00' },
		{ token: 'attribute.name.css.id', foreground: 'C52F00' },
		{ token: 'attribute.name.css.pseudo', foreground: 'FF3E00', fontStyle: 'italic' },
		{ token: 'attribute.value', foreground: '7A4520' },
		{ token: 'attribute.value.css', foreground: '7A4520' },
		{ token: 'attribute.value.css.function', foreground: '5A3A8A' },
		{ token: 'operator.css', foreground: '7A7062' },
		{ token: 'delimiter.curly', foreground: '7A7062' },
		{ token: 'delimiter.parenthesis', foreground: '7A7062' },
		{ token: 'delimiter.square', foreground: '7A7062' },
		{ token: 'delimiter.angle', foreground: '7A7062' },
		{ token: 'delimiter', foreground: '7A7062' },
		{ token: 'keyword.js', foreground: '5A3A8A' },
		{ token: 'keyword.type', foreground: '1D5D4A' },
		{ token: 'string', foreground: '7A4520' },
		{ token: 'string.escape', foreground: 'C52F00' },
		{ token: 'number', foreground: '2E5A3A' },
		{ token: 'number.float', foreground: '2E5A3A' },
		{ token: 'number.hex', foreground: '2E5A3A' },
		{ token: 'comment', foreground: '9A8B75', fontStyle: 'italic' },
		{ token: 'comment.html', foreground: '9A8B75', fontStyle: 'italic' },
		{ token: 'operator', foreground: '1A1612' },
		{ token: 'identifier', foreground: '1A1612' }
	],
	colors: {
		'editor.background': '#F1E8D6',
		'editor.foreground': '#1A1612',
		'editor.lineHighlightBackground': '#E6DAC1',
		'editor.lineHighlightBorder': '#00000000',
		'editorLineNumber.foreground': '#B8AB93',
		'editorLineNumber.activeForeground': '#7A7062',
		'editor.selectionBackground': '#FF3E0033',
		'editor.inactiveSelectionBackground': '#1A161214',
		'editorCursor.foreground': '#FF3E00',
		'editorWhitespace.foreground': '#1A161214',
		'editorIndentGuide.background': '#1A16120F',
		'editorIndentGuide.activeBackground': '#1A161229',
		'editorBracketMatch.background': '#FF3E0020',
		'editorBracketMatch.border': '#FF3E0080',
		'scrollbar.shadow': '#00000000',
		'scrollbarSlider.background': '#1A161220',
		'scrollbarSlider.hoverBackground': '#1A161240',
		'scrollbarSlider.activeBackground': '#1A161260',
		'editorGutter.background': '#F1E8D6',
		'editorWidget.background': '#E6DAC1',
		'editorWidget.border': '#1A161229',
		'editorSuggestWidget.background': '#E6DAC1',
		'editorSuggestWidget.border': '#1A161229',
		'editorSuggestWidget.foreground': '#1A1612',
		'editorSuggestWidget.selectedBackground': '#FF3E0020',
		'editorSuggestWidget.highlightForeground': '#C52F00',
		'editorHoverWidget.background': '#E6DAC1',
		'editorHoverWidget.border': '#1A161229',
		'editorOverviewRuler.border': '#00000000'
	}
};

export function registerSvelteLanguage(monaco: typeof Monaco): void {
	// Register Svelte language
	monaco.languages.register({ id: SVELTE_LANGUAGE_ID });

	// Set language configuration
	monaco.languages.setLanguageConfiguration(SVELTE_LANGUAGE_ID, svelteLanguageConfiguration);

	// Set tokenizer
	monaco.languages.setMonarchTokensProvider(SVELTE_LANGUAGE_ID, svelteTokensProvider);

	// Define and apply theme
	monaco.editor.defineTheme('svelte-cream', svelteCreamTheme);
}
