
*{
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  margin: 0;
  background: #fff;
  color: #012169;
}
.chart-container {
  width: 80vw;
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(1,33,105,0.12);
  padding: 24px 16px 16px 16px;
}
#geochart {
  width: 80vw;
  max-width: 1100px;
  height: 500px;
  margin: 0 auto 48px auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(1,33,105,0.12);
  padding: 24px 16px 16px 16px;
}
#countryApiChartArea {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
}
.country-item {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  color: #012169;
  border: 1px solid #01216922;
}
.api-chart-container {
  margin-left: 40px;
  margin-top: 10px;
  background: #f4f8fb;
  border-radius: 8px;
  padding: 12px 8px 8px 8px;
  border: 1px solid #01216922;
}
.page-footer {
  background: #012169;
  color: #fff;
  padding: 32px 0;
  margin-top: 64px;
  text-align: center;
}
.footer-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}
.footer-container p {
  margin: 8px 0;
  font-size: 14px;
}
.footer-links a {
  color: #fff;
  text-decoration: none;
  margin: 0 8px;
}
.footer-links a:hover {
  text-decoration: underline;
  color: #8dc63f;
}
.canary-group-item {
  margin: 24px 0;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
}
.canary-group-item:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  border-color: #009639;
}
.canary-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.canary-platform-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.availability-badge {
  display: inline-block;
  background: #009639;
  color: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 32px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0,153,57,0.3);
}
.availability-label {
  display: inline-block;
  margin-left: 16px;
  color: #666;
  font-size: 16px;
  vertical-align: middle;
}
.breakdown-toggle {
  background: #0078d4;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 12px;
}
.breakdown-toggle:hover {
  background: #005a9e;
}
.breakdown-toggle.expanded {
  background: #0078d4;
}
.breakdown-toggle::before {
  content: '▼ ';
  font-size: 12px;
}
.breakdown-toggle.collapsed::before {
  content: '▶ ';
}
.canary-apis-container {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  display: none;
  border: 1px solid #e0e0e0;
}
.canary-apis-container.expanded {
  display: block;
  animation: slideDown 0.3s ease;
}
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}
.availability-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}
.api-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.api-label {
  min-width: 120px;
  font-weight: bold;
  color: #012169;
  font-size: 14px;
  text-align: left;
}
.day-blocks {
  display: flex;
  gap: 2px;
  flex: 1;
}
.day-block {
  width: 16px;
  height: 24px;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.day-block:hover {
  transform: scale(1.2);
  z-index: 10;
}
.day-block.success {
  background-color: #009639;
}
.day-block.warning {
  background-color: #FFA500;
}
.day-block.error {
  background-color: #DC3545;
}
.day-block-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.chart-bar {
  width: 16px;
  margin-top: 2px;
  background: #e0e0e0;
  border-radius: 2px;
  height: 30px;
  position: relative;
  overflow: hidden;
}
.bar-high {
  position: absolute;
  bottom: 0;
  width: 100%;
  transition: height 0.3s;
}
.bar-success {
  background: #009639;
}
.bar-warning {
  background: #FFA500;
}
.bar-error {
  background: #DC3545;
}
.bar-label {
  font-size: 9px;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
}
.availability-header {
  font-size: 20px;
  font-weight: bold;
  color: #012169;
  margin-bottom: 20px;
  text-align: left;
}
.date-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  margin-top: 12px;
  padding: 0 120px 0 132px;
}
.page-header {
  background: #012169;
  padding: 0 0 0 0;
  margin-bottom: 32px;
  box-shadow: 0 2px 12px #01216922;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 72px;
}
.header-logo-container {
  display: flex;
  align-items: center;
}
.header-logo {
  height: 48px;
}
.header-id {
  font-size: 1.1em;
  font-weight: bold;
  background: #fff;
  color: #012169;
  padding: 8px 18px;
  border-radius: 8px;
  margin-left: 24px;
}
.page-title {
  text-align: center;
  color: #012169;
  margin: 32px 0 24px 0;
  font-size: 2.5em;
}
.trend-chart-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}
.trend-chart-canvas {
  max-height: 300px;
}
.trend-chart-canvas-small {
  max-height: 250px;
}

/* API Expansion Styles */
.apis-section {
  margin-top: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.apis-section-header {
  font-size: 20px;
  font-weight: bold;
  color: #012169;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #009639;
}

.api-item {
  margin-bottom: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.api-item:hover {
  border-color: #009639;
  box-shadow: 0 2px 8px rgba(0,150,57,0.15);
}

.api-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s;
}

.api-item-header:hover {
  background: #f8f9fa;
}

.api-name {
  font-size: 16px;
  font-weight: 600;
  color: #012169;
  flex: 1;
}

.api-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.api-stats .availability-badge {
  padding: 8px 16px;
  font-size: 16px;
}

.expand-icon {
  font-size: 14px;
  color: #666;
  transition: transform 0.3s ease;
  display: inline-block;
}

.api-details {
  padding: 0 20px 20px 20px;
  background: #fafbfc;
  border-top: 1px solid #e0e0e0;
  animation: slideDown 0.3s ease;
}

.api-chart-container {
  margin-top: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.api-chart-canvas {
  max-height: 250px;
}


/* ========================= 
   RESPONSIVE MEDIA QUERIES
========================= */

/* Better media queries matching your actual structure */
@media screen and (max-width: 768px) {
  .page-title {
    font-size: 1.8em;
  }
  
  #geochart {
    width: 95vw;
    height: 400px;
    padding: 16px 12px;
  }
  
  .chart-container {
    width: 95vw;
    padding: 16px 12px;
  }
  
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 16px;
    gap: 16px;
  }
  
  .canary-platform-name {
    font-size: 20px;
  }
  
  .availability-badge {
    font-size: 24px;
    padding: 12px 16px;
  }
}

@media screen and (max-width: 480px) {
  .page-title {
    font-size: 1.5em;
  }
  
  #geochart {
    width: 100vw;
    height: 300px;
    padding: 12px 8px;
    border-radius: 8px;
  }
  
  .day-blocks {
    gap: 1px;
  }
  
  .day-block {
    width: 10px;
    height: 16px;
  }
  
  .api-label {
    min-width: 80px;
    font-size: 12px;
  }
}
