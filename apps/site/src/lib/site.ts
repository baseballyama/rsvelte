// The /learn table of contents. Headings are rendered from here (`<H2 id>`), so the sidebar, the
// in-page anchors and the chapter order cannot drift apart.

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

const s = (id: string, title: string): Section => ({ id, title });

export const chapters: Chapter[] = [
	{
		slug: 'intro',
		href: '/learn',
		number: '00',
		title: 'この教材について',
		abstract: '誰のための教材か、どう読むか、何が本物で何がモデルか。',
		minutes: 4,
		sections: [s('audience', '想定読者'), s('honesty', '本物とモデル'), s('path', '読む順番')]
	},
	{
		slug: 'kernel',
		href: '/learn/kernel',
		number: '01',
		title: 'カーネルの全体像',
		abstract: 'カーネルとプラグインの境界、12 のモジュール、1 文書が通る道。',
		minutes: 12,
		sections: [
			s('why', 'なぜカーネルなのか'),
			s('layers', '層と境界'),
			s('modules', 'モジュール地図'),
			s('life', '1 文書の一生'),
			s('promises', '設計上の約束')
		]
	},
	{
		slug: 'source',
		href: '/learn/kernel/source',
		number: '02',
		title: '位置 — Span と LineIndex',
		abstract: '8 バイトの Span、合成ノードの Loc、UTF-8 バイトから UTF-16 列へ。',
		module: 'kernel/source',
		minutes: 10,
		sections: [
			s('span', 'Span は 8 バイト'),
			s('loc', 'Loc と合成ノード'),
			s('line-index', 'LineIndex'),
			s('utf16', 'UTF-16 列を数える'),
			s('offset', '逆向き: 行と列からバイトへ')
		]
	},
	{
		slug: 'intern',
		href: '/learn/kernel/intern',
		number: '03',
		title: '名前 — Interner',
		abstract: '1 本のバッファと開番地法のテーブル。名前ごとの割り当てをしない。',
		module: 'kernel/intern',
		minutes: 7,
		sections: [
			s('why', 'なぜインターンするか'),
			s('layout', 'バッファと ends'),
			s('table', '開番地法のテーブル'),
			s('growth', '成長と負荷率')
		]
	},
	{
		slug: 'db',
		href: '/learn/kernel/db',
		number: '04',
		title: '一度だけ計算する — Artifact と Ctx',
		abstract: '文書ごとの遅延キャッシュ。compile と format と lint が同じパースを共有する仕組み。',
		module: 'kernel/db',
		minutes: 14,
		sections: [
			s('artifact', 'Artifact トレイト'),
			s('registry', 'TypeId から slot へ'),
			s('get', 'Ctx::get'),
			s('sharing', '共有と孤立'),
			s('cycles', '循環と !Sync'),
			s('attribution', '誰の時間として数えるか')
		]
	},
	{
		slug: 'pipeline',
		href: '/learn/kernel/pipeline',
		number: '05',
		title: 'スケジューラ — Registry と run_each',
		abstract: '言語・タスク・プロジェクトタスクの登録と、文書単位の並列実行、ストリーミング。',
		module: 'kernel/pipeline',
		minutes: 16,
		sections: [
			s('document', 'Document と Language'),
			s('tasks', 'Task と ProjectTask'),
			s('registry', 'Registry'),
			s('run-document', 'run_document と panic の隔離'),
			s('run-each', 'run_each とストリーミング'),
			s('project', 'プロジェクトパス'),
			s('run', 'run は run_each の上にある')
		]
	},
	{
		slug: 'diagnostics',
		href: '/learn/kernel/diagnostics',
		number: '06',
		title: '診断と lint',
		abstract: 'Diagnostic、近似しないための Unsupported、Rule の契約と並び順。',
		module: 'kernel/lint',
		minutes: 8,
		sections: [
			s('diagnostic', 'Diagnostic'),
			s('unsupported', 'Unsupported — 近似しない'),
			s('rule', 'Rule トレイト'),
			s('order', '並び順'),
			s('render', 'ESLint の位置で書き出す')
		]
	},
	{
		slug: 'doc',
		href: '/learn/kernel/doc',
		number: '07',
		title: 'レイアウト — Doc IR とプリンタ',
		abstract: 'Prettier の printDocToString を移植したプリンタ。fits、fill、group id、flat_only。',
		module: 'kernel/doc',
		minutes: 20,
		sections: [
			s('ir', '文書 IR とアリーナ'),
			s('printer', 'プリンタのループ'),
			s('fits', 'fits と残りのコマンド'),
			s('fill', 'fill'),
			s('group-ids', 'group id'),
			s('flat-only', 'flat_only と Refused'),
			s('mutation', 'アリーナは不変ではない')
		]
	},
	{
		slug: 'emit',
		href: '/learn/kernel/emit',
		number: '08',
		title: '出力と写像 — Emitter',
		abstract: '出力バッファと写像、最大下界の逆引き、source map v3 と VLQ。',
		module: 'kernel/emit',
		minutes: 15,
		sections: [
			s('emitter', 'Emitter と Mapping'),
			s('lookup', '逆引きは最大下界'),
			s('lookup-span', '範囲を写す'),
			s('source-map', 'source map v3 と VLQ'),
			s('disagreement', 'lookup と source_map を揃える'),
			s('edits', 'Edits')
		]
	},
	{
		slug: 'json',
		href: '/learn/kernel/json',
		number: '09',
		title: 'JSON を直接書く — JsonWriter',
		abstract: '値の木を作らずに書く。状態はフラグのスタックとビット 1 つ。',
		module: 'kernel/json',
		minutes: 5,
		sections: [s('state', '状態は 2 つだけ'), s('escape', 'エスケープ')]
	},
	{
		slug: 'metrics',
		href: '/learn/kernel/metrics',
		number: '10',
		title: '計測 — CountingAlloc と phase',
		abstract: 'スレッドごとの割り当て計数、入れ子を除く排他的フェーズ、ピーク増分。',
		module: 'kernel/metrics',
		minutes: 12,
		sections: [
			s('alloc', 'CountingAlloc'),
			s('phases', '排他的なフェーズ'),
			s('merge', 'スレッドの表をまとめる'),
			s('global', 'track_global とピーク'),
			s('off', 'feature なしなら何も残らない')
		]
	},
	{
		slug: 'pool',
		href: '/learn/kernel/pool',
		number: '11',
		title: 'バッファの再利用 — pool',
		abstract: '文書をまたいで Vec の容量を使い回す、スレッドローカルのプール。',
		module: 'kernel/pool',
		minutes: 6,
		sections: [s('idea', '考え方'), s('take-give', 'take と give'), s('limits', '上限と順序'), s('measure', '効果を測る')]
	},
	{
		slug: 'measure',
		href: '/learn/measure',
		number: '12',
		title: '実測',
		abstract: 'コーパス全体でアームを比べる。何が効いて、何が効いていないか。',
		minutes: 10,
		sections: [
			s('arms', 'アーム'),
			s('time', '時間'),
			s('memory', 'メモリと割り当て'),
			s('phases', 'フェーズ'),
			s('correctness', '速さは正しさではない'),
			s('reproduce', '再現する')
		]
	},
	{
		slug: 'polish',
		href: '/learn/polish',
		number: '13',
		title: '磨きどころ',
		abstract: 'コードを読んで見つけた、直す価値のある箇所と、それぞれをどうしたか。',
		minutes: 12,
		sections: [
			s('correctness', '正しさ'),
			s('contracts', '契約と文書'),
			s('performance', '性能'),
			s('measurement', '計測')
		]
	}
];

export const appendix = [
	{ href: '/learn/reference', title: 'リファレンス', abstract: 'カーネルの全項目を検索する。' },
	{ href: '/learn/playground', title: 'Doc プレイグラウンド', abstract: '文書 IR を書いて、プリンタの判断を追う。' }
];

export function chapterByHref(pathname: string): Chapter | undefined {
	const p = pathname.replace(/\/$/, '') || '/';
	return chapters.find((c) => c.href === p);
}

export function sectionTitle(chapter: Chapter, id: string): string {
	const sec = chapter.sections.find((x) => x.id === id);
	if (!sec) throw new Error(`chapter ${chapter.slug} has no section ${id}`);
	return sec.title;
}

export function chapter(slug: string): Chapter {
	const c = chapters.find((x) => x.slug === slug);
	if (!c) throw new Error(`no chapter ${slug}`);
	return c;
}
