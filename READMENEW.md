* Ensure full page height & natural flow */
html, body {
  height: 100%;
}

body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Ensure main content never overlaps footer */
.page-footer {
  margin-top: auto;
}

/* Give last content enough breathing room before footer */
.chart-container,
#geochart,
#countryApiChartArea,
.canary-group-item,
.apis-section {
  margin-bottom: 48px;
}

/* Prevent animated containers from collapsing height */
.canary-apis-container,
.api-details {
  overflow: visible;
}

/* ========================= MOBILE VIEWPORT FIX ========================= */

/* Fix mobile vh issues (Chrome, Safari) */
@media screen and (max-width: 768px) {
  body {
    min-height: 100svh;
  }

  .page-footer {
    padding-bottom: 40px;
  }
}

/* Extra safety for very small devices */
@media screen and (max-width: 480px) {
  .chart-container,
  #geochart {
    margin-bottom: 64px;
  }
}

/* ========================= LARGE SCREEN SAFETY ========================= */

@media screen and (min-width: 1440px) {
  body {
    min-height: 100vh;
  }

  /* Improve vertical rhythm */
  .page-title {
    margin-top: 48px;
    margin-bottom: 40px;
  }

  /* Give content more air before footer */
  .chart-container,
  #geochart,
  .canary-group-item,
  .apis-section {
    margin-bottom: 72px;
  }

  /* Prevent footer floating too high */
  .page-footer {
    padding-top: 48px;
    padding-bottom: 48px;
  }
}

/* Ultra-wide / 4K displays */
@media screen and (min-width: 1920px) {
  .chart-container,
  #geochart,
  #countryApiChartArea {
    max-width: 1200px;
  }
}
