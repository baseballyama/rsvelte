<script lang="ts"></script>

{#if isQueryBuilderQuery(queryBase)}
  <QueryBuilder
    bind:query={queryBase}
    binaryConditionOnAdded={{
      type: 'BINARY',
      left: { field: '', fieldType: 'STRING' },
      masterBinaryOperator: 'EQUAL',
      right: '',
    } satisfies BinaryCondition}
  />
{/if}
