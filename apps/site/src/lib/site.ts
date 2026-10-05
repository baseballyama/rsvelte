// The /learn table of contents. Headings are rendered from here (`<H2 id>`), so the sidebar, the
// in-page anchors and the chapter order cannot drift apart. Ids, numbers and paths are shared by both
// languages, so a link with an anchor works after the reader switches language.

import { bilingual, langOf, langs, localizedPath, type Lang } from './i18n.ts';

export const REPO_URL = 'https://github.com/baseballyama/rsvelte';

export interface Section {
	id: string;
	title: string;
}

export interface Chapter {
	slug: string;
	href: string;
	number: string;
	title: string;
	/** One line for the chapter list. */
	abstract: string;
	/** The kernel module the chapter explains, as a source key. */
	module?: string;
	minutes: number;
	sections: Section[];
}

type Text = Record<Lang, string>;

interface ChapterSource extends Omit<Chapter, 'title' | 'abstract' | 'sections'> {
	title: Text;
	abstract: Text;
	sections: { id: string; title: Text }[];
}

const s = (id: string, ja: string, en: string) => ({ id, title: bilingual(ja, en) });

const sources: ChapterSource[] = [
	{
		slug: 'intro',
		href: '/learn',
		number: '00',
		title: bilingual('この教材について', 'About this guide'),
		abstract: bilingual('誰のための教材か、どう読むか、何が本物で何がモデルか。', 'Who this guide is for, how to read it, and which parts are real code and which are models.'),
		minutes: 4,
		sections: [s('audience', '想定読者', 'Who this guide is for'), s('honesty', '本物とモデル', 'Real code and models'), s('path', '読む順番', 'Reading order')]
	},
	{
		slug: 'kernel',
		href: '/learn/kernel',
		number: '01',
		title: bilingual('カーネルの全体像', 'The kernel at a glance'),
		abstract: bilingual('カーネルとプラグインの境界、モジュールの役割、1 文書が通る道、二つ目の言語 Vue と svue。', 'The border between the kernel and plugins, the role of each module, the path of one document, and Vue and svue as the second language.'),
		minutes: 15,
		sections: [
			s('why', 'なぜカーネルなのか', 'Why a kernel'),
			s('overview', '全体の構成 — 役割とデータの流れ', 'Overview: roles and data flow'),
			s('layers', '層と境界', 'Layers and borders'),
			s('modules', 'モジュールの役割', 'What each module does'),
			s('life', 'ファイルを処理する手順', 'How one file is processed'),
			s('languages', '二つ目の言語 — Vue と svue', 'The second language: Vue and svue'),
			s('promises', '設計上の約束', 'Design promises')
		]
	},
	{
		slug: 'source',
		href: '/learn/kernel/source',
		number: '02',
		title: bilingual('ソース内の位置と行・列の変換', 'Source positions and line and column conversion'),
		abstract: bilingual('ソース内の範囲を8バイトで保存する方法と、バイト位置を行・列に変換する仕組み。', 'How a range in the source fits in 8 bytes, and how a byte position becomes a line and a column.'),
		module: 'kernel/source/positions',
		minutes: 10,
		sections: [
			s('span', 'ソース内の範囲を8バイトで保存する', 'Store a source range in 8 bytes'),
			s('loc', '元のソースにない要素の位置', 'Positions of elements that are not in the source'),
			s('line-index', 'バイト位置と行・列を対応させる', 'Map byte positions to lines and columns'),
			s('utf16', '外部ツールが使う文字数の数え方', 'How external tools count characters'),
			s('offset', '行と列からバイト位置を求める', 'Find a byte position from a line and a column')
		]
	},
	{
		slug: 'intern',
		href: '/learn/kernel/interning',
		number: '03',
		title: bilingual('名前の保存と共有', 'Storing and sharing names'),
		abstract: bilingual('1 本のバッファと開番地法のテーブル。名前ごとの割り当てをしない。', 'One buffer and an open addressing table. No allocation for each name.'),
		module: 'kernel/source/interning',
		minutes: 7,
		sections: [
			s('why', '同じ名前を一度だけ保存する理由', 'Why each name is stored once'),
			s('layout', '名前の文字列と末尾の位置', 'Name strings and their end positions'),
			s('table', '開番地法のテーブル', 'The open addressing table'),
			s('growth', '配列を拡張するタイミング', 'When the arrays grow')
		]
	},
	{
		slug: 'db',
		href: '/learn/kernel/database',
		number: '04',
		title: bilingual('計算結果の保存と再利用', 'Storing and reusing computed results'),
		abstract: bilingual('コンパイル、整形、コード検査で構文解析の結果を共有する仕組み。型検査には、各言語が生成したコードを共通の窓口から渡す。', 'How compiling, formatting and linting share one parse result. For type checking, each language passes the code it generates through one shared interface.'),
		module: 'kernel/computation/database',
		minutes: 18,
		sections: [
			s('artifact', '保存する計算結果の型', 'Types of stored results'),
			s('registry', '計算結果の型と保存先を登録する', 'Register result types and where they are stored'),
			s('get', '計算結果を取得する', 'Get a computed result'),
			s('sharing', '結果を共有する場合と個別に計算する場合', 'When results are shared and when they are computed again'),
			s('cycles', '計算の循環を検出する', 'Detect cycles in computation'),
			s('attribution', '計算時間をどの処理に記録するか', 'Which work gets the computation time'),
			s('facet', '共通の呼び出し窓口 — 言語ごとの答え', 'One shared interface, one answer for each language')
		]
	},
	{
		slug: 'layers',
		href: '/learn/kernel/layers',
		number: '05',
		title: bilingual('構文木と解析結果の持ち方', 'How syntax trees and analysis results are stored'),
		abstract: bilingual('構文木の要素を型付きの番号で参照し、変数と宣言の対応を別の表に保存する。コンパイル用に整理した構文木は、別の言語からも作れる。', 'Tree elements are referenced by typed numbers, and the links between variables and declarations are kept in a separate table. The tree arranged for compiling can also be built from another language.'),
		module: 'kernel/source/index',
		minutes: 20,
		sections: [
			s('why', 'なぜ層を重ねるのか', 'Why the data is layered'),
			s('ids', '型付きの識別番号と解析結果の表', 'Typed identifiers and tables of analysis results'),
			s('niche', '空き値を利用した識別番号と大きさの固定', 'Identifiers that use a spare value, and fixed sizes'),
			s('tokens', '元の文字列をすべて保持する — トークン表', 'Keep every character of the source: the token table'),
			s('stack', '言語プラグインの層の例', 'Example layers of a language plugin'),
			s('resolve', '名前解決', 'Name resolution'),
			s('compiler_syntax_tree', 'コンパイル用に整理した構文木', 'The syntax tree arranged for compiling'),
			s('svue', 'Vue のコンポーネントを Svelte のランタイムで動かす', 'Run Vue components on the Svelte runtime'),
			s('vuelte', 'Svelte のコンポーネントを Vue Vapor のランタイムで動かす', 'Run Svelte components on the Vue Vapor runtime'),
			s('lint', '構文解析直後の検査と解析結果を使う検査', 'Checks right after parsing and checks that use analysis results'),
			s('shared-lint', '言語をまたぐ判断', 'Decisions across languages'),
			s('next', 'この先の層', 'Layers still to come')
		]
	},
	{
		slug: 'pipeline',
		href: '/learn/kernel/pipeline',
		number: '06',
		title: bilingual('処理の登録と並列実行', 'Registering work and running it in parallel'),
		abstract: bilingual('タスク・プロジェクトタスク・共通の呼び出し窓口の提供元の登録と、文書単位の並列実行、ストリーミング。', 'Registering tasks, project tasks and providers of the shared interfaces, running in parallel one document at a time, and streaming.'),
		module: 'kernel/computation/pipeline',
		minutes: 16,
		sections: [
			s('document', '入力文書と処理対象の判定', 'Input documents and which tasks apply to them'),
			s('tasks', '一つの文書の処理と複数の文書の処理', 'Work on one document and work on many documents'),
			s('registry', '処理の登録先', 'Where work is registered'),
			s('run-document', '文書ごとの処理と異常終了への対処', 'Work on each document and recovery from a panic'),
			s('run-each', '結果ができた文書から順に返す', 'Return each document as soon as its results are ready'),
			s('project', '複数の文書をまとめて処理する', 'Process many documents together'),
			s('run', '並列処理の結果をロックなしで集める', 'Collect parallel results without locks')
		]
	},
	{
		slug: 'diagnostics',
		href: '/learn/kernel/diagnostics',
		number: '07',
		title: bilingual('エラーや警告の報告とコード検査', 'Reporting errors and warnings, and linting'),
		abstract: bilingual('Diagnostic、近似しないための Unsupported、Rule の守るべき条件と並び順。', 'Diagnostic, Unsupported for cases the tool will not approximate, and the conditions and sort order that every Rule must keep.'),
		module: 'lint/rules',
		minutes: 8,
		sections: [
			s('diagnostic', 'エラーや警告の記録', 'Recording errors and warnings'),
			s('unsupported', '未対応の構文を報告する', 'Report syntax that is not supported'),
			s('rule', '検査ルールが実装する処理', 'What a lint rule implements'),
			s('order', '並び順', 'Sort order'),
			s('render', 'ESLint の位置で書き出す', 'Write positions the way ESLint does')
		]
	},
	{
		slug: 'doc',
		href: '/learn/kernel/document',
		number: '08',
		title: bilingual('改行と字下げの決め方', 'Deciding line breaks and indentation'),
		abstract: bilingual('Prettier と同じ規則で、一行に収めるか改行するかを決める。整形用のデータ構造と、それを文字列にする処理。', 'Decide, with the same rules as Prettier, whether code stays on one line or breaks. The formatting data structure, and the printer that turns it into text.'),
		module: 'kernel/output/document',
		minutes: 20,
		sections: [
			s('ir', '整形用のデータ構造と保存領域', 'The formatting data structure and its storage'),
			s('printer', '整形の指示を順に処理する', 'Process formatting instructions in order'),
			s('fits', '一行に収まるかを確かめる', 'Check whether content fits on one line'),
			s('fill', '単語を収まるだけ一行に並べる', 'Put as many words on a line as fit'),
			s('group-ids', '改行の判断を共有する', 'Share a line break decision'),
			s('flat-only', '改行なしで出力できる場合だけ返す', 'Return output only when it fits without line breaks'),
			s('mutation', '保存した整形指示を書き換える', 'Change stored formatting instructions')
		]
	},
	{
		slug: 'emit',
		href: '/learn/kernel/emitter',
		number: '09',
		title: bilingual('生成したコードと元のソースの位置を対応させる', 'Mapping generated code back to the source'),
		abstract: bilingual('出力バッファと位置の対応、指定位置以前で最も近い対応点の逆引き、source map v3 と 可変長の整数表現。', 'The output buffer and its position mappings, finding the nearest mapping at or before a position, source map version 3, and variable-length integers.'),
		module: 'kernel/output/emitter',
		minutes: 15,
		sections: [
			s('emitter', '文字列の出力と位置の記録', 'Write text and record positions'),
			s('lookup', '生成した位置から元の位置を求める', 'Find the source position of a generated position'),
			s('lookup-span', '生成したコードの範囲を元のソースに戻す', 'Map a range of generated code back to the source'),
			s('source-map', '外部ツール向けに位置の対応表を書き出す', 'Write the position mappings for external tools'),
			s('disagreement', '内部と外部で位置の対応を揃える', 'Make internal and external mappings agree'),
			s('edits', 'ソース内の一部を置き換える', 'Replace part of the source')
		]
	},
	{
		slug: 'json',
		href: '/learn/kernel/structured-data',
		number: '10',
		title: bilingual('構造化データを直接書き出す', 'Writing structured data directly'),
		abstract: bilingual('値の木を作らずに書く。状態はフラグのスタックとビット 1 つ。', 'Write output without building a tree of values. The only state is a stack of flags and one bit.'),
		module: 'kernel/output/structured_data',
		minutes: 5,
		sections: [s('state', '状態は 2 つだけ', 'Only two pieces of state'), s('escape', 'エスケープ', 'Escaping')]
	},
	{
		slug: 'metrics',
		href: '/learn/kernel/measurement',
		number: '11',
		title: bilingual('処理時間とメモリの計測', 'Measuring time and memory'),
		abstract: bilingual('メモリを確保する回数と大きさを数える。処理時間は、内側で呼んだ別の処理の時間を差し引いて記録する。', 'Count how often memory is allocated and how much. Record the time of each step without the time of the steps it calls.'),
		module: 'kernel/performance/measurement',
		minutes: 12,
		sections: [
			s('alloc', 'メモリを確保する回数と大きさを数える', 'Count memory allocations and their sizes'),
			s('phases', '別の処理にかかった時間を差し引く', 'Subtract the time of nested work'),
			s('merge', 'スレッドの表をまとめる', 'Merge the tables of each thread'),
			s('global', '処理全体の計測と最大使用量', 'Whole-run measurements and peak use'),
			s('off', '計測を無効にしたビルドの動作', 'What happens in a build without measurement')
		]
	},
	{
		slug: 'pool',
		href: '/learn/kernel/buffer-pool',
		number: '12',
		title: bilingual('作業用メモリの再利用', 'Reusing working memory'),
		abstract: bilingual('文書をまたいで Vec の容量を使い回す、スレッドローカルのプール。持ち主ごとの鍵と、スレッドあたりの予算。', 'A thread-local pool that reuses Vec capacity across documents, with a key for each owner and a budget for each thread.'),
		module: 'kernel/performance/buffer_pool',
		minutes: 10,
		sections: [
			s('idea', '考え方', 'The idea'),
			s('take-give', '作業用の配列を借りて返す', 'Borrow a working array and give it back'),
			s('keyed', '異なる用途の配列を区別する', 'Keep arrays for different uses apart'),
			s('limits', '上限と予算', 'Limits and budgets'),
			s('users', 'プールを使う構造', 'Structures that use the pool'),
			s('measure', '効果を測る', 'Measure the effect')
		]
	},
	{
		slug: 'measure',
		href: '/learn/measure',
		number: '13',
		title: bilingual('実測 — 性能の基準値との比較検査', 'Measurements: checks against performance baselines'),
		abstract: bilingual('割り当てと命令数を決定的に数え、main と experimental への push と pull request で基準値と比べる。正しさの基準値との比較検査と、実行時間のベンチマーク。', 'Count allocations and instructions in a repeatable way, and compare them with the baselines on each push to main and experimental and on each pull request. Also: checks against the correctness baselines, and timing benchmarks.'),
		minutes: 14,
		sections: [
			s('ratchet', '性能の基準値との比較検査', 'Checks against performance baselines'),
			s('counters', '数えるもの', 'What is counted'),
			s('determinism', '同じ入力で同じ計測値を得る仕組み', 'How the same input gives the same counts'),
			s('ci', '変更時の自動検査と基準値の更新', 'Automatic checks on each change and updating the baselines'),
			s('parity', '正しさの基準値との比較検査', 'Checks against correctness baselines'),
			s('arms', '実行時間の比較対象', 'What the timing compares'),
			s('time', '時間', 'Time'),
			s('memory', 'メモリと割り当て', 'Memory and allocations'),
			s('phases', 'フェーズ', 'Phases'),
			s('reproduce', '再現する', 'Reproduce the results')
		]
	},
	{
		slug: 'polish',
		href: '/learn/polish',
		number: '14',
		title: bilingual('磨きどころ', 'Places to improve'),
		abstract: bilingual('最適化の記録と計測した差分。コードを読んで見つけた、直す価値のある箇所と、それぞれをどうしたか。', 'A record of optimizations and their measured differences. Places found by reading the code that are worth fixing, and what was done about each one.'),
		minutes: 16,
		sections: [
			s('history', '最適化の記録', 'Optimization record'),
			s('correctness', '正しさ', 'Correctness'),
			s('contracts', '守るべき条件と文書', 'Conditions and documents to keep'),
			s('performance', '性能', 'Performance'),
			s('measurement', '計測', 'Measurement')
		]
	},
	{
		slug: 'plugins',
		href: '/learn/plugins',
		number: '15',
		title: bilingual('プラグインを実装する', 'Writing a plugin'),
		abstract: bilingual('独自の計算結果とタスクをカーネルに登録する手順。既存の言語プラグインの構文木を使う例を実行する。', 'How to register your own result types and tasks with the kernel. You run an example that uses the syntax tree of an existing language plugin.'),
		minutes: 12,
		sections: [
			s('boundary', 'ライブラリとして使う場合とタスクとして使う場合', 'Using the kernel as a library or as tasks'),
			s('parsed', '構文解析の結果を保存する', 'Store the parse result'),
			s('artifact', '構文解析の結果から独自の値を計算する', 'Compute your own value from the parse result'),
			s('task', '計算結果を使うタスクを実装する', 'Write a task that uses the computed value'),
			s('register', '必要な型とタスクを登録する', 'Register the types and tasks you need'),
			s('host', '呼び出し側から実行する', 'Run it from the caller'),
			s('extension', '言語を追加する場合と複数の文書を扱う場合', 'Adding a language and working with many documents')
		]
	}
];

const appendixSources = [
	{
		href: '/why',
		title: bilingual('なぜrsvelteを作るのか', 'Why we are building rsvelte'),
		abstract: bilingual('テンプレートの構文解析、独自のlintルール、解析結果の共有、クロスファイル最適化の目的と実装状況。', 'The goals and current state of template parsing, custom lint rules, shared analysis results, and optimization across files.')
	},
	{ href: '/learn/reference', title: bilingual('リファレンス', 'Reference'), abstract: bilingual('カーネルの全項目を検索する。', 'Search every item of the kernel.') },
	{
		href: '/learn/playground',
		title: bilingual('パイプラインのプレイグラウンド', 'Pipeline playground'),
		abstract: bilingual('言語プラグインを付け外しし、ソースの解析と出力を追う。', 'Turn language plugins on and off, and follow how the source is analyzed and printed.')
	},
	{
		href: '/learn/playground/doc',
		title: bilingual('整形の判断を試す', 'Try formatting decisions'),
		abstract: bilingual('整形用のデータ構造を書いて、プリンタの判断を追う。', 'Write the formatting data structure and follow the decisions of the printer.')
	}
];

export interface AppendixEntry {
	href: string;
	title: string;
	abstract: string;
}

function localize(lang: Lang): { chapters: Chapter[]; appendix: AppendixEntry[] } {
	return {
		chapters: sources.map((c) => ({
			...c,
			href: localizedPath(c.href, lang),
			title: c.title[lang],
			abstract: c.abstract[lang],
			sections: c.sections.map((x) => ({ id: x.id, title: x.title[lang] }))
		})),
		appendix: appendixSources.map((a) => ({ href: localizedPath(a.href, lang), title: a.title[lang], abstract: a.abstract[lang] }))
	};
}

const localized = Object.fromEntries(langs.map((lang) => [lang, localize(lang)])) as Record<Lang, ReturnType<typeof localize>>;

/** Chapters with text and links in `lang`. */
export function chaptersIn(lang: Lang): Chapter[] {
	return localized[lang].chapters;
}

export function appendixIn(lang: Lang): AppendixEntry[] {
	return localized[lang].appendix;
}

/** The Rust file a chapter's `module` key names, as the source plugin reads it. */
export function moduleFile(module: string): string {
	const [crate, ...rest] = module.split('/');
	const directory = crate === 'kernel' ? 'crates/kernel/src' : crate === 'lint' ? 'crates/tooling/lint/src' : null;
	if (!directory) throw new Error(`no crate directory for ${module}`);
	return `${directory}/${rest.join('/')}.rs`;
}

export function chapterByHref(pathname: string): Chapter | undefined {
	const p = pathname.replace(/\/$/, '') || '/';
	return chaptersIn(langOf(p)).find((c) => c.href === p);
}

export function sectionTitle(chapter: Chapter, id: string): string {
	const sec = chapter.sections.find((x) => x.id === id);
	if (!sec) throw new Error(`chapter ${chapter.slug} has no section ${id}`);
	return sec.title;
}

export function chapter(slug: string, lang: Lang): Chapter {
	const c = chaptersIn(lang).find((x) => x.slug === slug);
	if (!c) throw new Error(`no chapter ${slug}`);
	return c;
}
