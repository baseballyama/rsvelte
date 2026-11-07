<!-- <script lang="ts">
  import type { TransformedDoc } from 'typedoc-better-json'

  import Code from '$doclib/Code.svelte'
  import d from '$doclib/typedoc/transformed-doc.json' with { type: 'json' }
  import Inspect from '$lib/index.js'

  const docs = d as TransformedDoc
</script>

<Inspect value={docs} />

{#each d.variables as v}
  <h2>{v.name}</h2>
  <pre><code>{v.type.code}</code></pre>
{/each}

{#each d.types as t}
  <h2><small style="color: var(--red)">{t.kind}</small> {t.name}</h2>
  {#if t.type.code}
    <Code code={t.type.code} label="" language="javascript" />
  {/if}

  {#if t.typeDeclaration}
    {#each t.typeDeclaration as member}
      <h3>- {member.name}</h3>
      <p>
        @type<br />
        <code>{member.type.code}</code>
      </p>
      {#each member.blockTags as tag}
        {#if tag.tag === '@default'}
          <p>
            @default<br />
            {#each tag.summary as sum}
              {#if sum.type === 'code'}
                <code>{(sum as { value: string }).value}</code>
              {/if}
            {/each}
          </p>
        {/if}
      {/each}

      {#if member.summary}
        {#each member.summary as s}
          {#if s.type === 'paragraph'}
            <p>
              {#each s.children as c}
                {#if c.type === 'text'}
                  {c.value}
                {:else if c.type === 'inlineCode'}
                  <code>{c.value}</code>
                {:else}
                  [{c.type}]
                {/if}
              {/each}
            </p>
          {/if}
        {/each}
      {/if}
    {/each}
  {:else if t.type}{/if}

  <hr />
{/each}

<style>
  p {
    padding-left: 2ch;
  }
</style> -->
