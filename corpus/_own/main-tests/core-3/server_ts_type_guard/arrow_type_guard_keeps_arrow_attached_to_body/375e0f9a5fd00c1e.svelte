<script lang="ts">
  type Op = 'EQUAL' | 'NOT_EQUAL';
  const isOp = (
    op: Op | 'OTHER',
  ): op is Op =>
    op === 'EQUAL' ||
    op === 'NOT_EQUAL';
</script>