export const terms: Record<string, string> = {
	DocumentContext: '文書ごとの保存領域',
	SourceLocation: '元のソース上の位置の有無',
	TypedIndex: '型付きの識別番号',
	SyntaxTree: '構文木',
	COMPILER_SyntaxTree: 'コンパイル用に整理した構文木',
	IntermediateRepresentation: '中間表現',
	database: '計算結果の保存と再利用',
	index: '型付きの識別番号',
	diagnostic: 'エラーや警告の情報',
	doc: '整形用のデータ構造',
	'database.rs': '計算結果を管理する実装ファイル',
	'index.rs': '識別番号を扱う実装ファイル',
	'diagnostic.rs': 'エラーや警告を扱う実装ファイル',
	'document.rs': 'コードを整形する実装ファイル',
	'DocumentContext::get': '必要な計算結果を取得する関数',
	'DocumentContext::new': '計算結果の管理領域を作る関数',
	TypeScriptView: '型検査用のコードと位置情報',
	TypeScriptDocument: '型検査用の文書',
	LayoutInstructions: '整形用データの保存領域',
	LayoutInstruction: '整形の指示',
	StructuredDataWriter: '構造化データを書き出す処理',
	CountingAllocator: 'メモリ割り当てを数える処理',
	'rsvelte_typescript_check::TypeScriptView': '型検査用のコードと位置情報を取得する共通窓口',
	'TypeScriptDocument::Unchecked': '型検査が不要という結果',
	'SourceLocation::span': '元のソース上の範囲を取り出す関数',
	'DocumentContext::line_index': '行と列の対応表を取得する関数'
};

export function term(name: string): string {
	const label = terms[name];
	if (!label) throw new Error(`Missing reader label for ${name}`);
	return label;
}
