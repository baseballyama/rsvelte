<script lang="ts">
let {
    direct,
    nested: { assigned = 1, ...object_rest },
    list: [array_first, , { deep }, ...array_rest],
    ...outer_rest
} = {} as any;
</script>