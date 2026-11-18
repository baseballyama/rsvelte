<script lang="ts">
  const isValibotErrorMessage = (message: string) => {
    return /["']success["']\s*:\s*false/.test(message);
  };
  const initDatadog = () => {
    const ddSite = 'ap1.datadoghq.com';
    const ddVersion = '1.0.0';
    if (ddSite) {
      console.log({ site: ddSite, version: ddVersion });
    }
  };
</script>
<div></div>