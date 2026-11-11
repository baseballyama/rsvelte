{#if true}
	{@const integer = Number.isInteger(1)}
	{@const parsed = Number.parseInt('3')}
	{@const string = String('A')}
	{@const character = String.fromCharCode(65)}
	{@const half = Math.f16round(1.337)}
	{@const unknown = Number.MAX_SAFE_INTEGER}

	<p>{integer}{parsed}{string}{character}{half}{unknown}</p>
{/if}
