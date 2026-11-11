<script lang="ts">
  type AccountDisabledBody = Awaited<
    ReturnType<Extract<MfaVerifyResponse, { status: 403 }>["json"]>
  >;
</script>
