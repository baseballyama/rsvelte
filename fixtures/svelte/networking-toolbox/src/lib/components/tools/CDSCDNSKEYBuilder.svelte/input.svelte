<script lang="ts">
  import Icon from '$lib/components/global/Icon.svelte';
  import {
    parseDNSKEYRecord,
    validateDNSKEY,
    generateCDSRecords,
    generateCDNSKEYRecord,
    formatCDSRecord,
    formatCDNSKEYRecord,
    validateCDSCDNSKEYUsage,
    DNSSEC_ALGORITHMS,
    DS_DIGEST_TYPES,
    type DNSKEYRecord,
    type DSRecord,
  } from '$lib/utils/dnssec';

  let dnskeyInput = $state(
    'example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...',
  );
  let ownerName = $state('example.org.');
  let generateCDS = $state(true);
  let generateCDNSKEY = $state(true);
  let isActiveExample = $state(true);

  let results = $state<{
    error: string | null;
    dnskey: DNSKEYRecord | null;
    cdsRecords: DSRecord[];
    cdnskeyRecord: DNSKEYRecord | null;
    warnings: string[];
  }>({ error: null, dnskey: null, cdsRecords: [], cdnskeyRecord: null, warnings: [] });

  let isGenerating = $state(false);
  let copiedStates = $state<Record<string, boolean>>({});

  function calculateResults() {
    if (!dnskeyInput.trim()) {
      results = { error: null, dnskey: null, cdsRecords: [], cdnskeyRecord: null, warnings: [] };
      return;
    }

    const validation = validateDNSKEY(dnskeyInput);
    if (!validation.valid) {
      results = {
        error: validation.error || 'Invalid DNSKEY record',
        dnskey: null,
        cdsRecords: [],
        cdnskeyRecord: null,
        warnings: [],
      };
      return;
    }

    const dnskey = parseDNSKEYRecord(dnskeyInput);
    if (!dnskey) {
      results = {
        error: 'Failed to parse DNSKEY record',
        dnskey: null,
        cdsRecords: [],
        cdnskeyRecord: null,
        warnings: [],
      };
      return;
    }

    const usageValidation = validateCDSCDNSKEYUsage(dnskey);
    const cdnskeyRecord = generateCDNSKEY ? generateCDNSKEYRecord(dnskey) : null;

    results = {
      error: null,
      dnskey,
      cdsRecords: [],
      cdnskeyRecord,
      warnings: usageValidation.warnings,
    };

    generateRecordsAsync();
  }

  async function generateRecordsAsync() {
    if (!results.dnskey || !ownerName.trim()) return;

    isGenerating = true;
    try {
      if (generateCDS) {
        const cdsRecords = await generateCDSRecords(results.dnskey, ownerName);
        results.cdsRecords = cdsRecords;
      } else {
        results.cdsRecords = [];
      }
    } catch (err) {
      console.error('Error generating CDS records:', err);
      results.cdsRecords = [];
    } finally {
      isGenerating = false;
    }
  }

  async function copyToClipboard(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedStates[key] = true;
      setTimeout(() => {
        copiedStates[key] = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function copyAllRecords() {
    const records: string[] = [];

    if (generateCDS && results.cdsRecords.length > 0) {
      records.push('# CDS Records');
      results.cdsRecords.forEach((cds) => {
        records.push(formatCDSRecord(cds, ownerName));
      });
    }

    if (generateCDNSKEY && results.cdnskeyRecord) {
      if (records.length > 0) records.push('');
      records.push('# CDNSKEY Record');
      records.push(formatCDNSKEYRecord(results.cdnskeyRecord, ownerName));
    }

    copyToClipboard(records.join('\n'), 'all');
  }

  function handleInputChange() {
    if (
      isActiveExample &&
      dnskeyInput !==
        'example.org. 3600 IN DNSKEY 257 3 8 AwEAAcvvJUWJNrPOTMmNhZmJLk85n4Pz+KqvfxJ1X0O+fJ4GJNdqsNvP1mQJJv8A4dNn...'
    ) {
      isActiveExample = false;
    }
    calculateResults();
  }

  // Initialize
  calculateResults();
</script>

<div class="card">
  <header class="card-header">
    <h1>CDS/CDNSKEY Builder</h1>
    <p>
      Build CDS/CDNSKEY RRs from child DNSKEYs to enable automated DS updates at the parent. These records allow child
      zones to signal DS record changes to parent zones for automated DNSSEC maintenance.
    </p>
  </header>

  <!-- Input Form -->
  <div class="card input-card">
    <div class="form-group">
      <label for="dnskey-input">
        <Icon name="key" size="sm" />
        DNSKEY Record
      </label>
      <textarea
        id="dnskey-input"
        bind:value={dnskeyInput}
        oninput={handleInputChange}
        placeholder="example.org. 3600 IN DNSKEY 257 3 8 AwEAAc..."
        rows="4"
        class="dnskey-input {isActiveExample ? 'example-active' : ''}"
      ></textarea>
      {#if isActiveExample}
        <p class="field-help">Using example data - modify to see your results</p>
      {/if}
    </div>

    <div class="form-group">
      <label for="owner-name">
        <Icon name="dns" size="sm" />
        Owner Name
      </label>
      <input
        id="owner-name"
        bind:value={ownerName}
        oninput={handleInputChange}
        placeholder="example.org."
        class="owner-input"
      />
    </div>

    <div class="form-group">
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" class="styled-checkbox" bind:checked={generateCDS} onchange={handleInputChange} />
          Generate CDS Records
        </label>
        <label class="checkbox-label">
          <input type="checkbox" class="styled-checkbox" bind:checked={generateCDNSKEY} onchange={handleInputChange} />
          Generate CDNSKEY Record
        </label>
      </div>
    </div>
  </div>

  <!-- Error Display -->
  {#if results.error}
    <div class="card error-card">
      <div class="error-content">
        <Icon name="alert-triangle" size="sm" />
        <div>
          <strong>Error:</strong>
          {results.error}
        </div>
      </div>
    </div>
  {/if}

  <!-- Warnings -->
  {#if results.warnings.length > 0}
    <div class="card warning-card">
      <div class="warning-content">
        <Icon name="alert-triangle" size="sm" />
        <div>
          <strong>Warnings:</strong>
          <ul class="warning-list">
            {#each results.warnings as warning (warning)}
              <li>{warning}</li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/if}

  <!-- Results -->
  {#if results.dnskey}
    <!-- DNSKEY Information -->
    <div class="card dnskey-info-card">
      <div class="card-section-header">
        <h3>DNSKEY Information</h3>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Key Tag</span>
          <span class="info-value mono">{results.dnskey.keyTag || 'Calculating...'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Algorithm</span>
          <span class="info-value mono"
            >{results.dnskey.algorithm} ({DNSSEC_ALGORITHMS[
              results.dnskey.algorithm as keyof typeof DNSSEC_ALGORITHMS
            ] || 'Unknown'})</span
          >
        </div>
        <div class="info-item">
          <span class="info-label">Key Type</span>
          <span class="info-value mono">{results.dnskey.keyType || 'Unknown'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Flags</span>
          <span class="info-value mono">{results.dnskey.flags}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Protocol</span>
          <span class="info-value mono">{results.dnskey.protocol}</span>
        </div>
      </div>
    </div>

    <!-- Generation Status -->
    <div class="card status-card">
      <div class="status-content">
        <div class="status-item">
          {#if isGenerating}
            <div class="loading">
              <div class="spinner"></div>
              <span>Generating records...</span>
            </div>
          {:else}
            <div class="status success">
              <Icon name="check-circle" size="sm" />
              <span>Records generated</span>
            </div>
          {/if}
        </div>
        <div class="status-summary">
          <p>CDS: {generateCDS ? `${results.cdsRecords.length} records` : 'Disabled'}</p>
          <p>CDNSKEY: {generateCDNSKEY ? '1 record' : 'Disabled'}</p>
        </div>
      </div>
    </div>

    <!-- Generated Records -->
    {#if (generateCDS && results.cdsRecords.length > 0) || (generateCDNSKEY && results.cdnskeyRecord)}
      <div class="card records-card">
        <div class="records-header">
          <h3>Generated Records</h3>
          <button class="copy-button {copiedStates.all ? 'copied' : ''}" onclick={copyAllRecords}>
            <Icon name={copiedStates.all ? 'check' : 'copy'} size="sm" />
            Copy All
          </button>
        </div>

        {#if generateCDS && results.cdsRecords.length > 0}
          <div class="record-section">
            <h4>CDS Records (for parent zone):</h4>
            <div class="record-list">
              {#each results.cdsRecords as cds, i (cds.digest)}
                <div class="record-item">
                  <div class="record-content">
                    <div class="record-text mono">
                      {formatCDSRecord(cds, ownerName)}
                    </div>
                    <div class="record-meta">
                      {DS_DIGEST_TYPES[cds.digestType as keyof typeof DS_DIGEST_TYPES]} digest
                    </div>
                  </div>
                  <button
                    class="copy-button-small {copiedStates[`cds-${i}`] ? 'copied' : ''}"
                    onclick={() => copyToClipboard(formatCDSRecord(cds, ownerName), `cds-${i}`)}
                  >
                    <Icon name={copiedStates[`cds-${i}`] ? 'check' : 'copy'} size="xs" />
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if generateCDNSKEY && results.cdnskeyRecord}
          <div class="record-section">
            <h4>CDNSKEY Record (for child zone):</h4>
            <div class="record-list">
              <div class="record-item">
                <div class="record-content">
                  <div class="record-text mono">
                    {formatCDNSKEYRecord(results.cdnskeyRecord, ownerName)}
                  </div>
                  <div class="record-meta">Copy this to your child zone</div>
                </div>
                <button
                  class="copy-button-small {copiedStates.cdnskey ? 'copied' : ''}"
                  onclick={() =>
                    results.cdnskeyRecord &&
                    copyToClipboard(formatCDNSKEYRecord(results.cdnskeyRecord, ownerName), 'cdnskey')}
                >
                  <Icon name={copiedStates.cdnskey ? 'check' : 'copy'} size="xs" />
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  {/if}

  <!-- Educational Content -->
  <div class="education-card">
    <div class="education-grid">
      <div class="education-item info-panel">
        <h4>CDS Records</h4>
        <p>
          CDS (Child DS) records are placed in the child zone to signal DS record changes to the parent. Parents can
          automatically process these to update DS records in their zone.
        </p>
      </div>

      <div class="education-item info-panel">
        <h4>CDNSKEY Records</h4>
        <p>
          CDNSKEY (Child DNSKEY) records are copies of DNSKEYs placed in the child zone. Parents can use these to
          generate DS records automatically using their preferred digest algorithm.
        </p>
      </div>

      <div class="education-item info-panel">
        <h4>RFC 8078 Automation</h4>
        <p>
          These records enable automated DS maintenance as defined in RFC 8078. This reduces manual coordination between
          child and parent zones during key rollover.
        </p>
      </div>

      <div class="education-item info-panel">
        <h4>Implementation Notes</h4>
        <p>
          Always use KSK (Key Signing Key) records for CDS/CDNSKEY generation. Verify parent support for automated DS
          updates before relying on this mechanism.
        </p>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .input-card {
    margin-bottom: var(--spacing-lg);
  }

  .form-group {
    margin-bottom: var(--spacing-lg);

    label:not(.checkbox-label) {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-sm);
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .dnskey-input {
    width: 100%;
    padding: var(--spacing-md);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    resize: vertical;
    transition: all var(--transition-fast);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary), transparent 80%);
    }

    &.example-active {
      border-color: var(--color-warning);
      background-color: color-mix(in srgb, var(--color-warning), transparent 95%);
    }
  }

  .owner-input {
    width: 100%;
    font-family: var(--font-mono);
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    font-weight: 500;
    color: var(--text-primary);

    .styled-checkbox {
      appearance: none;
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-secondary);
      border-radius: var(--radius-sm);
      background-color: var(--bg-tertiary);
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
      margin: 0;

      &:checked {
        background-color: var(--color-primary);
        border-color: var(--color-primary);

        &::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--bg-primary);
          font-size: 12px;
          font-weight: bold;
        }
      }

      &:hover {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary), transparent 80%);
      }
    }
  }

  .field-help {
    color: var(--color-warning);
    font-size: var(--font-size-xs);
    margin-top: var(--spacing-xs);
    margin-bottom: 0;
  }

  .error-card,
  .warning-card {
    margin-bottom: var(--spacing-lg);
  }

  .error-card {
    border-color: var(--color-error);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-error), transparent 95%),
      color-mix(in srgb, var(--color-error), transparent 98%)
    );
  }

  .warning-card {
    border-color: var(--color-warning);
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-warning), transparent 95%),
      color-mix(in srgb, var(--color-warning), transparent 98%)
    );
  }

  .error-content,
  .warning-content {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    color: var(--text-primary);

    strong {
      color: var(--text-primary);
    }
  }

  .warning-list {
    list-style: disc;
    padding-left: var(--spacing-md);
    margin: var(--spacing-xs) 0 0 0;
  }

  .dnskey-info-card,
  .status-card,
  .records-card {
    margin-bottom: var(--spacing-lg);
  }

  .card-section-header {
    margin-bottom: var(--spacing-md);

    h3 {
      margin: 0;
      color: var(--text-primary);
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
  }

  .info-label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--text-secondary);
  }

  .info-value {
    font-size: var(--font-size-sm);
    color: var(--text-primary);

    &.mono {
      font-family: var(--font-mono);
    }
  }

  .status-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .status {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);

    &.success {
      color: var(--color-success);
    }
  }

  .loading {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--border-primary);
      border-top: 2px solid var(--color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .status-summary {
    text-align: right;

    @media (max-width: 768px) {
      text-align: left;
    }

    p {
      margin: 0;
      font-size: var(--font-size-xs);
      color: var(--text-secondary);
    }
  }

  .records-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);

    h3 {
      margin: 0;
    }
  }

  .copy-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);

    &:hover {
      background-color: var(--surface-hover);
    }

    &.copied {
      color: var(--color-success);
      border-color: var(--color-success);
    }
  }

  .record-section {
    margin-bottom: var(--spacing-xl);

    h4 {
      margin-bottom: var(--spacing-md);
      color: var(--text-primary);
    }
  }

  .record-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .record-item {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background-color: var(--bg-tertiary);
    border-radius: var(--radius-md);
  }

  .record-content {
    flex: 1;
    min-width: 0;
  }

  .record-text {
    font-size: var(--font-size-sm);
    word-break: break-all;
    line-height: 1.4;
    margin-bottom: var(--spacing-xs);

    &.mono {
      font-family: var(--font-mono);
    }
  }

  .record-meta {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }

  .copy-button-small {
    padding: var(--spacing-xs);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-sm);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    flex-shrink: 0;

    &:hover {
      background-color: var(--surface-hover);
    }

    &.copied {
      color: var(--color-success);
      border-color: var(--color-success);
    }
  }

  .education-card {
    border-top: 1px solid var(--border-secondary);
    padding-top: var(--spacing-xl);
  }

  .education-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
  }

  .education-item {
    padding: var(--spacing-lg);
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);

    h4 {
      margin-bottom: var(--spacing-md);
      font-size: var(--font-size-md);
      color: var(--color-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .info-grid {
      grid-template-columns: 1fr;
    }

    .education-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
