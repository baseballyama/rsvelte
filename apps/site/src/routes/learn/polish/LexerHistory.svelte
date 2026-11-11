<div class="prose-learn">
	<p>
		JavaScript と TypeScript の構文解析を oxc に任せたとき、この字句解析器は消しました。
	</p>
</div>

<div class="prose-learn">
	<ul>
		<li>
			<strong>改行の要否をノードを作るときに計算</strong>（コミット <code>708a4403d5</code>、命令数
			−4.07%）。
			<code>will_break</code> を表引きにしました。出力の前に木をたどる
			<code>propagate_breaks</code>
			とそのメモは消しました。アリーナのバッファもプールから借ります。<code>svelte.format</code>
			の割り当ては 1,070,011 回から 691,547 回に減りました（<a
				href="/learn/document-printer#printer">09 章</a
			>）。
		</li>
		<li>
			<strong>読み込み</strong>（コミット <code>a5822ee26f</code>、読み込みの命令数 −60.7%）。
			読み込みの大半は
			<code>Path</code>
			の解析でした。検証用のソースファイル集（公式ツールの出力と比べる、実在するファイルの集まり）は、ファイルを一つずつ検証例として読みます。その検証例を並べ替えるたびに、パスの部品を比べていました。さらに各検証例が祖先をたどり、管理用のディレクトリ
			<code>_registry/</code>
			を探して（一段ごとに
			<code>stat</code
			>）、接頭辞を取り除いていました。今は各ディレクトリの項目を名前順に深さ優先でたどるので、並べ替えなしで
			<code>Path::cmp</code>
			の順に出てきます。深さとソースからの相対パスは走査の途中で受け渡し、項目の種類は
			<code>stat</code> を使わずにディレクトリから読みます。
		</li>
		<li>
			<strong>トークン表とテンプレートの列をプールに</strong>（コミット
			<code>92571ee562</code>、バイト −45%）。
			<a href="/learn/kernel/buffer-pool#users">13 章</a>を参照。
		</li>
		<li>
			<strong>構文解析のリストを一本のスタックに</strong>（コミット
			<code>d5060ddc01</code>、割り当て −8.1%）。
			以前は、文や引数などのリストごとに配列を作り、構文木にコピーしていました。そのため 1
			ラウンドで 23.5 万回の割り当てがありました。この変更で、要素を構文木の一本のスタックへ積むようにしました。リストは入れ子になるので、最後に開いたリストが常に一番上にあります。閉じるときは、そのリストの要素をスタックの上から取り出し、構文木に移しました。この構文解析器も、oxc
			へ移したときに消しました。
		</li>
	</ul>
</div>

<div class="prose-learn">
	<ul>
		<li>
			<strong>プールの鍵を持ち主ごとに</strong>（コミット <code>20f5846343</code>、割り当て
			−6.7%）。
			<a href="/learn/kernel/buffer-pool#keyed">13 章</a>を参照。
		</li>
		<li>
			<strong>埋め込み言語へのトークンの受け渡し</strong>（コミット <code>ff65a1e66b</code>、バイト
			−19%）。
			以前は、テンプレートの式ごとにトークンとコメントをベクタに集めて渡していました。どちらも
			JavaScript のパーサが記録したものです。この量は 1 ラウンドで 36 メガバイト、全確保バイトの 5
			分の 1 でした。この変更で、両方をイテレータで位置の順に合流させながら渡すようにしました。
		</li>
	</ul>
</div>
