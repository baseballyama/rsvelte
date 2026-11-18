<Field label="Output" tag="fieldset" width="100%">
  <div class="flex flex-col gap-y-2">
    {#each selectedNode.data.config
      .outputContexts as outputContext, index (outputContext.key + index)}
      <div>{outputContext.key}</div>
    {/each}
  </div>
</Field>
