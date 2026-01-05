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
			[/./, 'style']
		]
	}
};

export const svelteDarkTheme: Monaco.editor.IStandaloneThemeData = {
	base: 'vs-dark',
	inherit: true,
	rules: [
		{ token: 'keyword.svelte', foreground: 'FF6B35', fontStyle: 'bold' },
		{ token: 'keyword.svelte.rune', foreground: 'FF9F1C', fontStyle: 'bold' },
		{ token: 'tag', foreground: '569CD6' },
		{ token: 'attribute.name', foreground: '9CDCFE' },
		{ token: 'attribute.name.svelte', foreground: 'FF9F1C' },
		{ token: 'attribute.value', foreground: 'CE9178' },
		{ token: 'delimiter.curly', foreground: 'FFD93D' },
		{ token: 'keyword.js', foreground: 'C586C0' },
		{ token: 'keyword.type', foreground: '4EC9B0' },
		{ token: 'string', foreground: 'CE9178' },
		{ token: 'number', foreground: 'B5CEA8' },
		{ token: 'comment.html', foreground: '6A9955' },
		{ token: 'operator', foreground: 'D4D4D4' },
		{ token: 'identifier', foreground: '9CDCFE' }
	],
	colors: {
		'editor.background': '#1a1a2e',
		'editor.foreground': '#D4D4D4',
		'editor.lineHighlightBackground': '#16213e',
		'editorLineNumber.foreground': '#858585',
		'editorLineNumber.activeForeground': '#C6C6C6',
		'editor.selectionBackground': '#264F78',
		'editor.inactiveSelectionBackground': '#3A3D41'
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
	monaco.editor.defineTheme('svelte-dark', svelteDarkTheme);
}
