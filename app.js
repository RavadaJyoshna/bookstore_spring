// ============================================
// Configuration
// ============================================
const API_BASE_URL = 'http://localhost:5000/api';  // Flask backend URL

// Data storage - will be populated from backend
let countries = [];
let countryData = [];
let countryCanaryData = {};

// ============================================
// API Functions - Fetch data from Flask backend
// ============================================

async function fetchCountryData() {
  try {
    console.log('Fetching country data from backend...');
    const response = await fetch(`${API_BASE_URL}/countries`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    countries = data.countries;
    countryData = data.percentages;
    
    console.log('✓ Country data loaded:', countries.length, 'countries');
    return data;
  } catch (error) {
    console.error('Error fetching country data:', error);
    // Fallback to mock data if backend is unavailable - Only 4 key countries
    console.log('Using fallback mock data');
    countries = ["United States of America", "Singapore", "Hong Kong", "Ireland"];
    const countryDataRaw = countries.map(() => Math.floor(Math.random() * 1000 + 200));
    const totalCalls = countryDataRaw.reduce((sum, val) => sum + val, 0);
    countryData = countryDataRaw.map(val => parseFloat(((val / totalCalls) * 100).toFixed(2)));
    return { countries, percentages: countryData };
  }
}

async function fetchCanaryGroupData(country) {
  try {
    console.log(`Fetching canary data for ${country}...`);
    const response = await fetch(`${API_BASE_URL}/canary-groups/${encodeURIComponent(country)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✓ Canary data loaded for ${country}:`, data.length, 'groups');
    return data;
  } catch (error) {
    console.error(`Error fetching canary data for ${country}:`, error);
    // Fallback to mock data with country-specific data
    return getMockCanaryData(country);
  }
}

// Fallback mock data generator
function getMockCanaryData(country = null) {
  // Country-specific canary groups
  const countryCanaryGroups = {
    'Singapore': ["sg-mobile-app", "sg-online-banking", "sg-payment-gateway"],
    'Hong Kong': ["hk-mobile-app", "hk-wealth-management", "hk-trading-platform"],
    'United States of America': ["us-retail-banking", "us-credit-card", "us-investment-services"],
    'Ireland': ["ie-digital-banking", "ie-loan-services", "ie-customer-portal"],
    'Brazil': ["br-mobile-banking", "br-payment-services", "br-digital-wallet"],
    'India': ["in-retail-banking", "in-upi-services", "in-mobile-banking"],
    'default': ["default-service-1", "default-service-2", "default-service-3"]
  };
  
  const canaryGroups = countryCanaryGroups[country] || countryCanaryGroups['default'];
  const apis = ["Login", "Register", "GetData", "Update", "Delete"];
  
  return canaryGroups.map(canaryGroup => ({
    name: canaryGroup,
    apis: apis.map(api => ({
      api,
      daily: Array.from({length: 60}, () => {
        const totalChecks = 12 * 24;
        const failedChecks = Math.floor(Math.random() * 30);
        const successRate = ((totalChecks - failedChecks) / totalChecks) * 100;
        return parseFloat(successRate.toFixed(2));
      })
    }))
  }));
}

let mainChart = null;

// Initialize dashboard - fetch data and draw map
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Dashboard initializing...');
  
  // Fetch country data from backend first
  await fetchCountryData();
  
  // Log countries to verify Singapore is included
  console.log('Countries loaded:', countries);
  console.log('Singapore included?', countries.includes('Singapore'));
  
  // Then draw the world map
  drawWorldMap();
});

function drawWorldMap() {
  const geochart = document.getElementById('geochart');
  geochart.innerHTML = `
    <div class="map-title-section">
      <h2>Global API Calls Distribution</h2>
      <p>Click on any country to view detailed analytics</p>
    </div>
    <div style="position: relative; width: 100%;">
      <canvas id="countryChart"></canvas>
      <!-- Visible marker dots with labels -->
      <style>
        .country-marker {
          position: absolute;
          width: 14px;
          height: 14px;
          background: #E53935;
          border: 3px solid #ffffff;
          border-radius: 50%;
          cursor: pointer;
          z-index: 1000;
          display: none;
          box-shadow: 0 2px 8px rgba(229, 57, 53, 0.5);
          transition: all 0.3s;
        }
        .country-marker:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 12px rgba(229, 57, 53, 0.7);
        }
        .marker-label {
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, #E53935 0%, #C62828 100%);
          color: white;
          padding: 8px 18px;
          border-radius: 8px;
          white-space: nowrap;
          font-size: 14px;
          font-weight: bold;
          pointer-events: none;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          letter-spacing: 0.5px;
        }
        .marker-label:before {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 8px solid #E53935;
        }
      </style>
      <div id="singaporeMarker" class="country-marker" title="Singapore">
        <div class="marker-label">Singapore</div>
      </div>
      <div id="hongkongMarker" class="country-marker" title="Hong Kong">
        <div class="marker-label">Hong Kong</div>
      </div>
      <div id="irelandMarker" class="country-marker" title="Ireland">
        <div class="marker-label">Ireland</div>
      </div>
      <div id="usaMarker" class="country-marker" title="United States of America">
        <div class="marker-label">USA</div>
      </div>
      <div id="brazilMarker" class="country-marker" title="Brazil">
        <div class="marker-label">Brazil</div>
      </div>
      <div id="indiaMarker" class="country-marker" title="India">
        <div class="marker-label">India</div>
      </div>
    </div>
  `;
  
  const ctx = document.getElementById('countryChart').getContext('2d');
  
  if (mainChart) {
    mainChart.destroy();
  }
  
  // Load GeoJSON map - High resolution version
  fetch('world-map-high-res.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load map data');
      }
      return response.json();
    })
    .then(geojson => {
      const countries_geo = geojson.features;
      
      // Map our country names to the actual names in the GeoJSON - Extended list
      const countryMapping = {
        'United States of America': 'United States of America',
        'Singapore': 'Singapore',
        'Hong Kong': 'Hong Kong',
        'Ireland': 'Ireland',
        'Brazil': 'Brazil',
        'India': 'India'
      };
      
      // Allow these countries (from image + your specified ones)
      const allowedCountries = ['United States of America', 'Singapore', 'Hong Kong', 'Ireland', 'Brazil', 'India'];
      
      // Create map data - match by name property
      const mapData = countries_geo.map(feature => {
        const featureName = feature.properties.name;
        const countryName = Object.keys(countryMapping).find(name => countryMapping[name] === featureName);
        
        // Only assign value if country is in our allowed list
        let value = 0;
        if (countryName && allowedCountries.includes(countryName)) {
          const countryIndex = countries.indexOf(countryName);
          value = countryIndex >= 0 ? countryData[countryIndex] : 25; // Default 25% if not in data
        }
        
        // Log if we found Singapore
        if (featureName === 'Singapore') {
          console.log('✓ Singapore found in map! Geometry:', feature.geometry.type, 'Value:', value);
        }
        
        return {
          feature: feature,
          value: value
        };
      });
      
      mainChart = new Chart(ctx, {
        type: 'choropleth',
        data: {
          labels: countries_geo.map(d => d.properties.ADMIN || d.properties.name),
          datasets: [{
            label: 'API Calls Distribution (%)',
            outline: countries_geo,
            data: mapData,
            backgroundColor: (context) => {
              if (context.dataIndex == null) return '#e8e8e8';
              const value = context.raw.value;
              const featureName = context.raw.feature.properties.name;
              
              // Only highlight our allowed countries with vibrant colors, all others grey
              if (value === 0) return '#e8e8e8'; // No data = grey
              
              // Assign distinct vibrant colors to each key country
              if (featureName === 'United States of America') return '#2196F3'; // Bright Blue
              else if (featureName === 'Ireland') return '#4CAF50'; // Green
              else if (featureName === 'Hong Kong') return '#FF9800'; // Orange
              else if (featureName === 'Singapore') return '#9C27B0'; // Purple
              else if (featureName === 'Brazil') return '#00C853'; // Bright Green
              else if (featureName === 'India') return '#1565C0'; // Dark Blue
              else return '#e8e8e8'; // All other countries = grey
            },
            hoverBackgroundColor: (context) => {
              if (context.dataIndex == null) return '#e8e8e8';
              const value = context.raw.value;
              const featureName = context.raw.feature.properties.name;
              
              if (value === 0) return '#e8e8e8';
              
              // Lighter/brighter colors on hover for our countries
              if (featureName === 'United States of America') return '#42A5F5'; // Lighter Blue
              else if (featureName === 'Ireland') return '#66BB6A'; // Lighter Green
              else if (featureName === 'Hong Kong') return '#FFB74D'; // Lighter Orange
              else if (featureName === 'Singapore') return '#AB47BC'; // Lighter Purple
              else if (featureName === 'Brazil') return '#69F0AE'; // Lighter Bright Green
              else if (featureName === 'India') return '#42A5F5'; // Lighter Dark Blue
              else return '#d0d0d0'; // Slightly lighter grey on hover
            },
            borderColor: (context) => {
              if (context.dataIndex == null) return '#ffffff';
              const value = context.raw.value;
              const featureName = context.raw.feature.properties.name;
              
              // White borders for our highlighted countries
              if (value > 0 && (featureName === 'United States of America' || 
                               featureName === 'Ireland' || 
                               featureName === 'Hong Kong' || 
                               featureName === 'Singapore' ||
                               featureName === 'Brazil' ||
                               featureName === 'India')) {
                return '#ffffff'; // White border for key countries
              }
              
              return '#cccccc'; // Light grey border for other countries
            },
            borderWidth: (context) => {
              if (context.dataIndex == null) return 0.5;
              const value = context.raw.value;
              const featureName = context.raw.feature.properties.name;
              
              // Thicker borders for our key countries
              if (value > 0 && (featureName === 'United States of America' || 
                               featureName === 'Ireland' || 
                               featureName === 'Hong Kong' || 
                               featureName === 'Singapore' ||
                               featureName === 'Brazil' ||
                               featureName === 'India')) {
                return 2.5; // Thicker border
              }
              
              return 0.5; // Thin border for other countries
            },
            hoverBorderColor: '#FFD700',
            hoverBorderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          showOutline: true,
          showGraticule: false,
          onHover: (event, activeElements) => {
            const canvas = event.native.target;
            if (activeElements.length > 0) {
              const featureName = activeElements[0].element.$context.raw.feature.properties.name;
              const value = activeElements[0].element.$context.raw.value;
              
              // Only show pointer cursor for all 6 allowed countries
              const allowedCountries = ['United States of America', 'Singapore', 'Hong Kong', 'Ireland', 'Brazil', 'India'];
              canvas.style.cursor = (value > 0 && allowedCountries.includes(featureName)) ? 'pointer' : 'default';
            } else {
              canvas.style.cursor = 'default';
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                title: function(context) {
                  const props = context[0].raw.feature.properties;
                  return props.ADMIN || props.name || 'Unknown';
                },
                label: function(context) {
                  const value = context.raw.value;
                  if (value > 0) {
                    return 'Overall API Calls: ' + value.toFixed(2) + '%';
                  }
                  return 'No data available';
                }
              },
              backgroundColor: 'rgba(229, 57, 53, 0.95)',
              titleFont: { size: 18, weight: 'bold' },
              bodyFont: { size: 16 },
              padding: 20,
              borderColor: '#ffffff',
              borderWidth: 2,
              displayColors: false,
              cornerRadius: 8
            }
          },
          scales: {
            projection: {
              axis: 'x',
              projection: 'equalEarth'
            }
          },
          onClick: function(evt, activeElements) {
            if (activeElements.length > 0) {
              const element = activeElements[0];
              const featureName = element.element.$context.raw.feature.properties.name;
              const foundCountry = Object.keys(countryMapping).find(name => countryMapping[name] === featureName);
              
              // Allow clicks on all 6 countries
              const allowedCountries = ['United States of America', 'Singapore', 'Hong Kong', 'Ireland', 'Brazil', 'India'];
              
              if (foundCountry && allowedCountries.includes(foundCountry) && element.element.$context.raw.value > 0) {
                showCanaryGroups(foundCountry);
              }
            }
          }
        }
      });
      
      // Add visible marker dots for all countries after chart is created
      setTimeout(() => {
        const canvas = document.getElementById('countryChart');
        const canvasRect = canvas.getBoundingClientRect();
        
        // Country positions - positioned exactly on each country's geographic location
        
        // USA marker - Center of continental United States
        const usaMarker = document.getElementById('usaMarker');
        if (usaMarker && mainChart) {
          const usLeft = canvasRect.width * 0.175; // Central USA
          const usTop = canvasRect.height * 0.40;
          usaMarker.style.left = usLeft + 'px';
          usaMarker.style.top = usTop + 'px';
          usaMarker.style.display = 'block';
          usaMarker.onclick = function(e) {
            e.stopPropagation();
            showCanaryGroups('United States of America');
          };
        }
        
        // Ireland marker - On Ireland (Western Europe)
        const irelandMarker = document.getElementById('irelandMarker');
        if (irelandMarker && mainChart) {
          const ieLeft = canvasRect.width * 0.465; // Ireland position
          const ieTop = canvasRect.height * 0.33;
          irelandMarker.style.left = ieLeft + 'px';
          irelandMarker.style.top = ieTop + 'px';
          irelandMarker.style.display = 'block';
          irelandMarker.onclick = function(e) {
            e.stopPropagation();
            showCanaryGroups('Ireland');
          };
        }
        
        // Hong Kong marker - On Hong Kong (Southern China coast)
        const hongkongMarker = document.getElementById('hongkongMarker');
        if (hongkongMarker && mainChart) {
          const hkLeft = canvasRect.width * 0.765; // Hong Kong coastal area
          const hkTop = canvasRect.height * 0.49;
          hongkongMarker.style.left = hkLeft + 'px';
          hongkongMarker.style.top = hkTop + 'px';
          hongkongMarker.style.display = 'block';
          hongkongMarker.onclick = function(e) {
            e.stopPropagation();
            showCanaryGroups('Hong Kong');
          };
        }
        
        // Singapore marker - On Singapore (Southeast Asia)
        const singaporeMarker = document.getElementById('singaporeMarker');
        if (singaporeMarker && mainChart) {
          const sgLeft = canvasRect.width * 0.738; // Singapore location (southern tip of Malay Peninsula)
          const sgTop = canvasRect.height * 0.555;
          singaporeMarker.style.left = sgLeft + 'px';
          singaporeMarker.style.top = sgTop + 'px';
          singaporeMarker.style.display = 'block';
          singaporeMarker.onclick = function(e) {
            e.stopPropagation();
            showCanaryGroups('Singapore');
          };
        }
        
        // Brazil marker - On Brazil (South America)
        const brazilMarker = document.getElementById('brazilMarker');
        if (brazilMarker && mainChart) {
          const brLeft = canvasRect.width * 0.32; // Brazil central location
          const brTop = canvasRect.height * 0.65;
          brazilMarker.style.left = brLeft + 'px';
          brazilMarker.style.top = brTop + 'px';
          brazilMarker.style.display = 'block';
          brazilMarker.onclick = function(e) {
            e.stopPropagation();
            showCanaryGroups('Brazil');
          };
        }
        
        // India marker - On India (South Asia)
        const indiaMarker = document.getElementById('indiaMarker');
        if (indiaMarker && mainChart) {
          const inLeft = canvasRect.width * 0.68; // India central location
          const inTop = canvasRect.height * 0.47;
          indiaMarker.style.left = inLeft + 'px';
          indiaMarker.style.top = inTop + 'px';
          indiaMarker.style.display = 'block';
          indiaMarker.onclick = function(e) {
            e.stopPropagation();
            showCanaryGroups('India');
          };
        }
      }, 500);
    })
    .catch(error => {
      console.error('Could not load world map:', error);
      geochart.innerHTML += '<p style="color: #DC3545; margin-top: 20px; padding: 20px; background: #fff3cd; border-radius: 8px;">⚠️ Error loading world map data. Please ensure world-map-complete.json file is present.</p>';
    });
}

// Function to show canary groups for a country
async function showCanaryGroups(country) {
  // Hide geochart
  document.getElementById('geochart').style.display = 'none';
  
  const area = document.getElementById('countryApiChartArea');
  area.innerHTML = '<div style="text-align: center; padding: 40px;"><p>Loading canary group data...</p></div>';
  
  // Fetch canary data from backend
  const fetchedCanaryData = await fetchCanaryGroupData(country);
  
  // Store in global cache
  countryCanaryData[country] = fetchedCanaryData;
  
  // Clear and create container
  area.innerHTML = '';
  
  const containerDiv = document.createElement('div');
  containerDiv.style.cssText = 'width: 100%; max-width: 1100px; margin: 0 auto; padding: 0;';
  
  const backButton = document.createElement('button');
  backButton.textContent = '← Back to Countries';
  backButton.style.cssText = 'background: #012169; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; margin-bottom: 20px; transition: all 0.3s;';
  backButton.onmouseover = function() { this.style.background = '#005eb8'; };
  backButton.onmouseout = function() { this.style.background = '#012169'; };
  backButton.onclick = function() {
    area.innerHTML = '';
    document.getElementById('geochart').style.display = 'block';
    drawWorldMap();
  };
  containerDiv.appendChild(backButton);
  
  const title = document.createElement('h2');
  title.style.cssText = 'color: #012169; margin-bottom: 32px; text-align: center; font-size: 28px;';
  title.textContent = `Canary Groups in ${country}`;
  containerDiv.appendChild(title);
  
  const canaryData = countryCanaryData[country];
  
  canaryData.forEach((canaryGroup, idx) => {
    // Calculate overall availability for this canary group
    const allRates = canaryGroup.apis.flatMap(api => api.daily);
    const overallAvailability = (allRates.reduce((sum, val) => sum + val, 0) / allRates.length).toFixed(1);
    
    const groupDiv = document.createElement('div');
    groupDiv.className = 'canary-group-item';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'canary-group-header';
    headerDiv.innerHTML = `
      <div class="canary-platform-name">${canaryGroup.name}</div>
      <div>
        <span class="availability-badge">${overallAvailability}%</span>
        <span class="availability-label">Last 60 Days Availability</span>
      </div>
    `;
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'breakdown-toggle collapsed';
    toggleBtn.textContent = 'Show Daily Breakdown';
    
    const apisContainer = document.createElement('div');
    apisContainer.className = 'canary-apis-container';
    apisContainer.id = `canary-${country}-${idx}`;
    
    toggleBtn.onclick = function(e) {
      e.stopPropagation();
      const isExpanded = apisContainer.classList.contains('expanded');
      
      if (isExpanded) {
        apisContainer.classList.remove('expanded');
        toggleBtn.classList.add('collapsed');
        toggleBtn.classList.remove('expanded');
        toggleBtn.textContent = 'Show Daily Breakdown';
      } else {
        apisContainer.classList.add('expanded');
        toggleBtn.classList.remove('collapsed');
        toggleBtn.classList.add('expanded');
        toggleBtn.textContent = 'Hide Daily Breakdown';
        drawAvailabilityGrid(country, idx, apisContainer, canaryGroup);
        setTimeout(() => {
          apisContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    };
    
    groupDiv.appendChild(headerDiv);
    groupDiv.appendChild(toggleBtn);
    groupDiv.appendChild(apisContainer);
    
    containerDiv.appendChild(groupDiv);
  });
  
  area.appendChild(containerDiv);
  
  setTimeout(() => {
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// Draw availability grid for a canary group
function drawAvailabilityGrid(country, canaryIdx, container, canaryGroup) {
  // Generate dates starting from Jan 1, 2026
  const dates = Array.from({length: 60}, (_, i) => {
    const date = new Date(2026, 0, 1);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  let html = `<div class="availability-header">60-Day Overall Availability Trend</div>`;
  html += `<div class="trend-chart-container">`;
  html += `<canvas id="trendChart-${country}-${canaryIdx}" class="trend-chart-canvas"></canvas>`;
  html += `</div>`;
  
  // Add individual API sections with expandable charts
  html += `<div class="api-list-header">API Endpoints</div>`;
  
  canaryGroup.apis.forEach((apiObj, apiIdx) => {
    const avgSuccess = (apiObj.daily.reduce((sum, val) => sum + val, 0) / apiObj.daily.length).toFixed(1);
    
    html += `<div class="api-item">`;
    html += `<div class="api-item-header" onclick="toggleApiChart('${country}', ${canaryIdx}, ${apiIdx})">`;
    html += `<div class="api-item-name">`;
    html += `<span class="api-expand-icon" id="icon-${country}-${canaryIdx}-${apiIdx}">▶</span>`;
    html += `<span>${apiObj.api}</span>`;
    html += `</div>`;
    html += `<span class="api-availability-badge">${avgSuccess}%</span>`;
    html += `</div>`;
    html += `<div class="api-chart-section" id="api-chart-${country}-${canaryIdx}-${apiIdx}" style="display: none;">`;
    html += `<canvas id="apiChart-${country}-${canaryIdx}-${apiIdx}" class="api-chart-canvas"></canvas>`;
    html += `</div>`;
    html += `</div>`;
  });
  
  container.innerHTML = html;
  
  // Draw the main trend chart
  setTimeout(() => {
    drawTrendChart(country, canaryIdx, canaryGroup, dates);
  }, 100);
}

// Toggle individual API chart visibility
function toggleApiChart(country, canaryIdx, apiIdx) {
  const chartSection = document.getElementById(`api-chart-${country}-${canaryIdx}-${apiIdx}`);
  const icon = document.getElementById(`icon-${country}-${canaryIdx}-${apiIdx}`);
  
  if (chartSection.style.display === 'none') {
    chartSection.style.display = 'block';
    icon.textContent = '▼';
    
    // Draw the API chart if not already drawn
    const canvasId = `apiChart-${country}-${canaryIdx}-${apiIdx}`;
    if (!window[`chart_${canvasId}`]) {
      drawApiChart(country, canaryIdx, apiIdx);
    }
  } else {
    chartSection.style.display = 'none';
    icon.textContent = '▶';
  }
}

// Draw individual API chart
function drawApiChart(country, canaryIdx, apiIdx) {
  const canaryGroup = countryCanaryData[country][canaryIdx];
  const apiObj = canaryGroup.apis[apiIdx];
  
  const dates = Array.from({length: 60}, (_, i) => {
    const date = new Date(2026, 0, 1);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  const labels = dates.map((date, idx) => {
    if (idx % 5 === 0) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return '';
  });
  
  const canvasId = `apiChart-${country}-${canaryIdx}-${apiIdx}`;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${apiObj.api} Success Rate`,
        data: apiObj.daily,
        borderColor: '#009639',
        backgroundColor: 'rgba(0, 150, 57, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: '#009639',
        pointBorderColor: '#fff',
        pointBorderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const idx = context[0].dataIndex;
              const date = dates[idx];
              return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            },
            label: function(context) {
              return `Success Rate: ${context.parsed.y.toFixed(2)}%`;
            }
          },
          backgroundColor: 'rgba(1, 33, 105, 0.9)',
          titleFont: { size: 13, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 90,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            },
            color: '#666',
            font: { size: 11 }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            color: '#666',
            font: { size: 10 },
            maxRotation: 0
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
  
  // Store chart reference
  window[`chart_${canvasId}`] = chart;
}

// Old grid code kept for reference
function drawAvailabilityGridOld(country, canaryIdx, container, canaryGroup) {
  const apiData = canaryGroup.apis;
  
  // Generate dates starting from Jan 1, 2026
  const dates = Array.from({length: 60}, (_, i) => {
    const date = new Date(2026, 0, 1);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  let html = `<div class="availability-header">60-Day Availability Trend</div>`;
  html += `<div class="availability-grid">`;
  
  apiData.forEach((apiObj) => {
    html += `<div class="api-row">`;
    html += `<div class="api-label">${apiObj.api}</div>`;
    html += `<div class="day-blocks">`;
    
    apiObj.daily.forEach((successRate, dayIdx) => {
      let blockClass = 'success';
      let barColorClass = 'bar-success';
      if (successRate < 95) {
        blockClass = 'error';
        barColorClass = 'bar-error';
      } else if (successRate < 99) {
        blockClass = 'warning';
        barColorClass = 'bar-warning';
      }
      
      const date = dates[dayIdx];
      const dateStr = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()}`;
      const barHeightPercent = (successRate / 100) * 100; // percentage of max height
      
      html += `<div class="day-block-wrapper">`;
      html += `<div class="day-block ${blockClass}" title="${dateStr}: ${successRate.toFixed(2)}%"></div>`;
      html += `<div class="chart-bar" title="${dateStr}: ${successRate.toFixed(2)}%">`;
      html += `<div class="bar-high ${barColorClass}" data-height="${barHeightPercent}"></div>`;
      html += `</div>`;
      html += `</div>`;
    });
    
    html += `</div>`;
    html += `</div>`;
  });
  
  html += `</div>`;
  
  // Add date labels
  const firstDate = dates[0];
  const midDate = dates[29];
  const lastDate = dates[59];
  
  html += `<div class="date-labels">`;
  html += `<span>11/29</span>`;
  html += `<span>${midDate.getDate()}/${midDate.getMonth() + 1}</span>`;
  html += `<span>1/27</span>`;
  html += `</div>`;
  
  // Add trend chart section
  html += `<div class="trend-chart-container">`;
  html += `<div class="trend-chart-title">Overall Availability Trend</div>`;
  html += `<canvas id="trendChart-${country}-${canaryIdx}" class="trend-chart-canvas-small"></canvas>`;
  html += `</div>`;
  
  container.innerHTML = html;
  
  // Apply dynamic bar heights via JavaScript
  setTimeout(() => {
    container.querySelectorAll('.bar-high').forEach(bar => {
      const heightPercent = bar.getAttribute('data-height');
      bar.style.height = (heightPercent * 0.3) + 'px'; // 30px max
    });
  }, 10);
  
  // Draw the trend chart after container is populated
  setTimeout(() => {
    drawTrendChart(country, canaryIdx, canaryGroup, dates);
  }, 100);
}

// Draw trend line chart for overall canary group availability
function drawTrendChart(country, canaryIdx, canaryGroup, dates) {
  const canvasId = `trendChart-${country}-${canaryIdx}`;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  // Calculate daily average across all APIs
  const dailyAverages = [];
  for (let day = 0; day < 60; day++) {
    let daySum = 0;
    canaryGroup.apis.forEach(api => {
      daySum += api.daily[day];
    });
    dailyAverages.push((daySum / canaryGroup.apis.length).toFixed(2));
  }
  
  const labels = dates.map((date, idx) => {
    if (idx % 5 === 0) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return '';
  });
  
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Overall Availability %',
        data: dailyAverages,
        fill: true,
        backgroundColor: 'rgba(0, 150, 57, 0.1)',
        borderColor: '#009639',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#009639',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#012169', font: { size: 12, weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Availability: ' + context.parsed.y + '%';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            color: '#012169',
            font: { weight: 'bold', size: 14 }
          },
          ticks: { color: '#666', maxRotation: 45, minRotation: 45 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: {
            display: true,
            text: 'Availability (%)',
            color: '#012169',
            font: { weight: 'bold', size: 14 }
          },
          min: 90,
          max: 100,
          ticks: {
            color: '#666',
            callback: function(value) {
              return value + '%';
            }
          },
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      }
    }
  });
}

// Toggle API details expansion
function toggleApiDetails(apiId) {
  const detailsDiv = document.getElementById(`details-${apiId}`);
  const icon = document.getElementById(`icon-${apiId}`);
  
  if (detailsDiv.style.display === 'none') {
    detailsDiv.style.display = 'block';
    icon.textContent = '▲';
    icon.style.transform = 'rotate(180deg)';
    
    // Draw the API chart if not already drawn
    if (!detailsDiv.dataset.chartDrawn) {
      const [country, canaryIdx, apiIdx] = apiId.split('-');
      const canaryGroup = countryCanaryData[country][parseInt(canaryIdx)];
      const apiData = canaryGroup.apis[parseInt(apiIdx)];
      drawApiChart(apiId, apiData);
      detailsDiv.dataset.chartDrawn = 'true';
    }
  } else {
    detailsDiv.style.display = 'none';
    icon.textContent = '▼';
    icon.style.transform = 'rotate(0deg)';
  }
}

// Draw individual API availability chart
function drawApiChart(apiId, apiData) {
  const canvasId = `apiChart-${apiId}`;
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  // Generate dates
  const dates = Array.from({length: 60}, (_, i) => {
    const date = new Date(2026, 0, 1);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  const labels = dates.map((date, idx) => {
    if (idx % 5 === 0) {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
    return '';
  });
  
  const ctx = canvas.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: apiData.api + ' Availability',
        data: apiData.daily,
        fill: true,
        backgroundColor: 'rgba(0, 94, 184, 0.1)',
        borderColor: '#005eb8',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: '#005eb8',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#012169', font: { size: 11, weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Availability: ' + context.parsed.y.toFixed(2) + '%';
            }
          },
          backgroundColor: 'rgba(1, 33, 105, 0.9)',
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 11 },
          padding: 10
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            color: '#012169',
            font: { weight: 'bold', size: 11 }
          },
          ticks: { color: '#666', font: { size: 10 }, maxRotation: 45, minRotation: 45 },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: {
            display: true,
            text: 'Availability (%)',
            color: '#012169',
            font: { weight: 'bold', size: 11 }
          },
          min: 85,
          max: 100,
          ticks: {
            color: '#666',
            font: { size: 10 },
            callback: function(value) {
              return value + '%';
            }
          },
          grid: { color: 'rgba(0,0,0,0.1)' }
        }
      }
    }
  });
}

// Old chart function - kept for reference but not used
function drawCanaryApiChart(country, canaryIdx, canvasId, canaryGroup) {
  const apiData = canaryGroup.apis;
  
  // Generate dates starting from Jan 1, 2026
  const days = Array.from({length: 60}, (_, i) => {
    const date = new Date(2026, 0, 1); // Jan 1, 2026
    date.setDate(date.getDate() + i);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  });
  
  // SCB color palette
  const scbColors = [
    '#009639', // green
    '#012169', // blue
    '#8dc63f', // light green
    '#00a19a', // teal
    '#005eb8'  // deep blue
  ];
  
  // Data is already in success rate percentage (0-100%)
  const datasets = apiData.map((apiObj, idx) => {
    return {
      label: apiObj.api,
      data: apiObj.daily, // Already percentage values
      fill: false,
      borderColor: scbColors[idx % scbColors.length],
      backgroundColor: scbColors[idx % scbColors.length],
      tension: 0.3,
      pointRadius: 2,
      borderWidth: 2
    };
  });
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `${canaryGroup.name} - API Success Rate (Last 60 Days)`, color: '#000' },
        legend: { display: true, labels: { color: '#000' } },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Day',
            color: '#000',
            font: { weight: 'bold', size: 16 }
          },
          ticks: { color: '#000' },
          grid: { color: 'rgba(1,33,105,0.2)'}
        },
        y: {
          title: {
            display: true,
            text: 'Success Rate (%)',
            color: '#000',
            font: { weight: 'bold', size: 16 }
          },
          ticks: { 
            color: '#000',
            callback: function(value) {
              return value + '%';
            }
          },
          min: 0,
          max: 100,
          grid: { color: 'rgba(1,33,105,0.2)' }
        }
      }
    }
  });
}
