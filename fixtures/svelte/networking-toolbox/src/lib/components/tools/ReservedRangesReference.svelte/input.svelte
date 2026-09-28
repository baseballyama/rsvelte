<script lang="ts">
  import { RESERVED_RANGES } from '$lib/constants/networks.js';
  import Tooltip from '$lib/components/global/Tooltip.svelte';
  import _SvgIcon from '$lib/components/global/SvgIcon.svelte';
  import Icon from '$lib/components/global/Icon.svelte';
  import '../../styles/converters.scss';
  import '../../styles/components.scss';
</script>

<div class="card">
  <header class="card-header">
    <h2>Reserved IP Ranges Reference</h2>
    <p>Special-purpose IP address ranges defined by RFCs and their intended uses.</p>
  </header>

  <!-- Reserved Ranges -->
  <div class="reference-section">
    {#each Object.entries(RESERVED_RANGES) as [rangeName, rangeInfo] (rangeName)}
      <Tooltip text="{rangeInfo.description} - Defined in {rangeInfo.rfc}" position="top">
        <div class="reference-card">
          <div class="card-header-inline">
            <div class="range-info">
              <h3 class="range-address">
                {rangeInfo.range}
              </h3>
              <span class="range-description">
                {rangeInfo.description}
              </span>
            </div>
            <span class="rfc-badge">
              {rangeInfo.rfc}
            </span>
          </div>

          <!-- Special highlighting for private networks -->
          {#if rangeName.includes('PRIVATE')}
            <div class="private-notice">
              <strong>Private Network:</strong> Not routed on the public Internet
            </div>
          {/if}
        </div>
      </Tooltip>
    {/each}
  </div>

  <!-- Explainer Section -->
  <div class="explainer-card">
    <h3>
      <Icon name="info" size="md" />
      Understanding Reserved IP Ranges
    </h3>
    <div class="explainer-content">
      <p>
        Reserved IP ranges serve specific purposes in networking and are defined by various RFCs (Request for Comments).
        Understanding these ranges is crucial for network planning and avoiding conflicts.
      </p>
      <div class="range-categories">
        <h4>Key Categories</h4>
        <ul>
          <li><strong>Private Networks (RFC 1918):</strong> Used for internal networks, not routed on the Internet</li>
          <li><strong>Loopback (RFC 1122):</strong> Traffic that never leaves the local machine</li>
          <li><strong>Link-Local (RFC 3927):</strong> Automatic IP configuration when DHCP is unavailable</li>
          <li><strong>Multicast (RFC 3171):</strong> One-to-many communication protocols</li>
        </ul>
      </div>
    </div>
  </div>
</div>
