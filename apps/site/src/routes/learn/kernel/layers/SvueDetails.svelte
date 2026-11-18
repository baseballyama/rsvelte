<script lang="ts">
	import Code from '#lib/components/Code.svelte';
	import type { ComponentProps } from 'svelte';

	type Excerpt = ComponentProps<typeof Code>['item'];

	let {
		code,
	}: { code: Record<'svueRegister' | 'svueTranslated' | 'svueInput' | 'svueClass', Excerpt> } =
		$props();
</script>

<Code item={code.svueRegister} />
<Code item={code.svueTranslated} />
<Code item={code.svueInput} />

<div class="prose-learn">
	<p>
		書き方が同じでも、二つのランタイムでは意味が違います。Vue の <code>{'{{ e }}'}</code> は
		<code>toDisplayString</code>
		を通るので、オブジェクトは <code>JSON.stringify</code> と同じ形の文字列になります。Svelte の
		<code>{'{e}'}</code>
		は <code>String(e)</code> です。Vue では、渡されなかった <code>Boolean</code> の prop は
		<code>false</code> になり、宣言していない属性はルート要素に引き継がれます。
	</p>
	<p>
		翻訳はこうした違いを、Vue と同じ規則で再現します。表示と繰り返しは Vue
		の関数をそのまま呼び、残りは Vue の規則を写したコードを出力します。
	</p>
	<ul>
		<li>補間：<code>vue</code> の <code>toDisplayString</code> を呼びます。</li>
		<li><code>v-for</code>：<code>renderList</code> を呼びます。</li>
		<li>
			<code>Boolean</code> の prop：runtime-core の <code>resolvePropValue</code> を写した
			<code>$derived.by</code> にします。
		</li>
		<li>
			サーバー向けの <code>v-model</code>：compiler-ssr の <code>ssrTransformModel</code> が出力するのと同じ属性にします。
		</li>
	</ul>
	<p>
		svue と比べられる公式のコンパイラはないので、出力の文字列でなく動作を比べます。公式の Vue
		でビルドしたコンポーネントで、操作の手順ごとに画面の要素の木とサーバー描画の結果を記録します。それを、rsvelte
		の出力を Svelte のランタイムで動かした記録と比べます。
	</p>
	<p>
		svue のために足したのは、<code>compiler_syntax_tree::spelled_text</code>
		だけです。足した先は、公式の Svelte コンパイラを Rust に移植した部分（以下、Svelte の移植）です。これは、別の言語から渡された文字列を、テキストとして構文木に置きます。足す前後で、<code
			>svelte.compile</code
		> の出力はバイト単位で一致しました。Svelte の移植はどれも公式のコンパイラと出力を突き合わせるので、svue
		のために振る舞いは変えません。
	</p>
	<p>
		翻訳が出力するのは、Svelte の移植が公式と同じにコンパイルできる構文だけです。Vue
		のテキストは空白をすでに畳んでいます。そのため Svelte のコンパイラは、公式の <code
			>preserveWhitespace</code
		> オプションを付けて走らせ、空白を二度畳まないようにします。
	</p>
	<p>
		ルートに引き継ぐ属性は <code>{'{...attrs}'}</code> にし、<code>class</code> は runtime-core の
		<code>mergeProps</code>
		と同じ規則で合成します。Vue は、props に <code>class</code>
		のキーがあるときだけ属性を書きます。そのため、自分の <code>class</code>
		を持たない要素では、スプレッド構文の中で合成します。動作の比較は、見えない空白と空の
		<code>class</code>
		属性を区別できません。そこで空白の扱いと空の <code>class</code> は、crate のテストで固定しています。
	</p>
</div>

<Code item={code.svueClass} />

<div class="prose-learn">
	<p>
		svue を入れた変更（コミット <code>73c8eea9c1</code>）では、手書きの 12
		検証例のうち、クライアント用で 4、サーバー用で 7 が一致しました。残りは拒否で、不一致は 0
		でした。拒否したのは、翻訳はあっても、Svelte の移植がまだコンパイルできない構文です。
	</p>
	<p>
		拒否した構文は、クライアント用の <code>v-model</code>、ルートへの属性の引き継ぎ（<code
			>{'{...attrs}'}</code
		>）、<code>&lt;select&gt;</code> です。クライアント用の <code>v-model</code> は、<code
			>{'{@attach}'}</code
		>
		で Vue の <code>vModelText</code> などを走らせます。Svelte の移植が対応してからは、クライアント用とサーバー用の両方で
		12 検証例すべてが一致します。
	</p>
	<p>
		公式の Vue コンパイラを Rust に移植した部分（Vue の移植）には、<code>v-on</code>
		の修飾子を足しました。<code>vue.compile</code> も compiler-dom と同じく、<code
			>withModifiers</code
		>
		と <code>withKeys</code> を使って出力します。
	</p>
</div>
