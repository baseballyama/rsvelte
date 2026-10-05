import { bilingual, type Lang } from './i18n.ts';

export const terms: Record<string, Record<Lang, string>> = {
	DocumentContext: bilingual('文書ごとの保存領域', 'the per-document store'),
	SourceLocation: bilingual('元のソース上の位置の有無', 'whether a position exists in the source'),
	TypedIndex: bilingual('型付きの識別番号', 'a typed identifier'),
	SyntaxTree: bilingual('構文木', 'the syntax tree'),
	database: bilingual('計算結果の保存と再利用', 'storing and reusing computed results'),
	index: bilingual('型付きの識別番号', 'typed identifiers'),
	diagnostic: bilingual('エラーや警告の情報', 'error and warning information'),
	doc: bilingual('整形用のデータ構造', 'the formatting data structure'),
	'database.rs': bilingual('計算結果を管理する実装ファイル', 'the file that manages computed results'),
	'index.rs': bilingual('識別番号を扱う実装ファイル', 'the file that handles identifiers'),
	'diagnostic.rs': bilingual('エラーや警告を扱う実装ファイル', 'the file that handles errors and warnings'),
	'document.rs': bilingual('コードを整形する実装ファイル', 'the file that formats code'),
	'DocumentContext::get': bilingual('必要な計算結果を取得する関数', 'the function that gets a computed result'),
	'DocumentContext::new': bilingual('計算結果の管理領域を作る関数', 'the function that creates the store for computed results'),
	TypeScriptView: bilingual('型検査用のコードと位置情報', 'the code and position mappings for type checking'),
	TypeScriptDocument: bilingual('型検査用の文書', 'a document for type checking'),
	LayoutInstructions: bilingual('整形用データの保存領域', 'the storage for formatting data'),
	StructuredDataWriter: bilingual('構造化データを書き出す処理', 'the writer for structured data'),
	CountingAllocator: bilingual('メモリ割り当てを数える処理', 'the allocator that counts memory allocations'),
	'rsvelte_typescript_check::TypeScriptView': bilingual('型検査用のコードと位置情報を取得する共通窓口', 'the shared interface that gets the code and position mappings for type checking'),
	'TypeScriptDocument::Unchecked': bilingual('型検査が不要という結果', 'the result that says no type check is needed'),
	'SourceLocation::span': bilingual('元のソース上の範囲を取り出す関数', 'the function that gets the range in the source'),
	'DocumentContext::line_index': bilingual('行と列の対応表を取得する関数', 'the function that gets the line and column table'),
};

export function term(name: string, lang: Lang): string {
	const label = terms[name];
	if (!label) throw new Error(`Missing reader label for ${name}`);
	return label[lang];
}
