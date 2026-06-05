/* ============================================================
   CALCULATOR ENGINE
   All formula logic lives here. Admin-editable assumptions
   are read from AppState.settings at calculation time.
   ============================================================ */

const Calculator = {

  /* ---------- COMPUTE ALL OUTPUTS ---------- */
  compute(inputs) {
    const {
      annualUsage,
      unitPrice,
      standingCharge,
      arraySize,
      battery,
      exportTariff,
      systemCost
    } = inputs;

    // Read global assumptions from settings
    const yieldPerKwp      = AppState.getSetting('yield_kwh_per_kwp', 850);
    const baselineSelfUse  = AppState.getSetting('baselineSelfUsePct_noBattery', 0.50);
    const maxSelfUse       = AppState.getSetting('maxSelfUsePct_bigBattery', 0.80);
    const co2Factor        = AppState.getSetting('co2_factor_kg_per_kwh', 0.233);
    const escalationRate   = AppState.getSetting('savingsEscalationRate', 0.03);

    // --- Current Annual Bill ---
    const currentBill = (annualUsage * unitPrice / 100) + (standingCharge / 100 * 365);

    // --- Solar Generation ---
    const generation = arraySize * yieldPerKwp;

    // --- Self-use % (battery-adjusted) ---
    const dailyUsage = annualUsage / 365;
    const batteryCoverage = dailyUsage > 0
      ? Math.min(battery / dailyUsage, 1)
      : 0;
    const selfUsePct = baselineSelfUse + (maxSelfUse - baselineSelfUse) * batteryCoverage;

    // --- Energy flows ---
    const selfConsumed = generation * selfUsePct;
    const exported     = generation - selfConsumed;

    // --- Financial outputs ---
    const gridImportSaving = selfConsumed * unitPrice / 100;
    const exportEarnings   = exported * exportTariff / 100;
    const totalAnnualSaving = gridImportSaving + exportEarnings;

    // --- Payback ---
    const paybackYears = totalAnnualSaving > 0
      ? systemCost / totalAnnualSaving
      : null;

    const monthlyAvgSaving = totalAnnualSaving / 12;

    // --- 25-year savings (inflation-escalated) ---
    let savings25yr = 0;
    for (let y = 0; y < 25; y++) {
      savings25yr += totalAnnualSaving * Math.pow(1 + escalationRate, y);
    }

    // --- CO2 avoided ---
    const co2Avoided = generation * co2Factor;

    return {
      currentBill:         round2(currentBill),
      generation:          round0(generation),
      selfUsePct:          round0(selfUsePct * 100),
      selfConsumed:        round0(selfConsumed),
      exported:            round0(exported),
      gridImportSaving:    round2(gridImportSaving),
      exportEarnings:      round2(exportEarnings),
      totalAnnualSaving:   round2(totalAnnualSaving),
      paybackYears:        paybackYears !== null ? round1(paybackYears) : null,
      monthlyAvgSaving:    round2(monthlyAvgSaving),
      savings25yr:         round0(savings25yr),
      co2Avoided:          round0(co2Avoided),
      systemCost:          systemCost,
      arraySize:           arraySize,
      battery:             battery
    };
  },

  /* ---------- FORMAT FOR DISPLAY ---------- */
  format(results) {
    return {
      currentBill:       fmtGBP(results.currentBill),
      totalAnnualSaving: fmtGBP(results.totalAnnualSaving),
      monthlyAvgSaving:  fmtGBP(results.monthlyAvgSaving),
      savings25yr:       fmtGBPk(results.savings25yr),
      paybackYears:      results.paybackYears !== null ? `${results.paybackYears}` : 'N/A',
      co2Avoided:        `${results.co2Avoided.toLocaleString('en-GB')} kg`,
      generation:        `${results.generation.toLocaleString('en-GB')} kWh`,
      selfUsePct:        `${results.selfUsePct}%`
    };
  },

  /* ---------- GET DEFAULT INPUTS FROM SETTINGS ---------- */
  getDefaultInputs() {
    return {
      annualUsage:   parseFloat(AppState.getSettingStr('default_annualUsage', '3800')),
      unitPrice:     parseFloat(AppState.getSettingStr('default_unitPrice', '28.5')),
      standingCharge:parseFloat(AppState.getSettingStr('default_standingCharge', '53.0')),
      arraySize:     parseFloat(AppState.getSettingStr('default_arraySize', '4.0')),
      battery:       parseFloat(AppState.getSettingStr('default_battery', '5.0')),
      exportTariff:  parseFloat(AppState.getSettingStr('default_exportTariff', '15.0')),
      systemCost:    parseFloat(AppState.getSettingStr('default_systemCost', '8500'))
    };
  }
};

/* ---- Number helpers ---- */
function round0(n) { return Math.round(n); }
function round1(n) { return Math.round(n * 10) / 10; }
function round2(n) { return Math.round(n * 100) / 100; }

function fmtGBP(n) {
  return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtGBPk(n) {
  if (n >= 1000) return '£' + (n / 1000).toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'k';
  return fmtGBP(n);
}
