// Replace 'your_json_url' with the URL to your earthquake JSON data
const jsonUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

fetch(jsonUrl)
  .then(response => response.json())
  .then(data => createMap(data))
  .catch(error => console.error('Error fetching data:', error));

function createMap(data) {
  const map = L.map('map').setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Function to determine the size of the marker based on magnitude
  function getMarkerSize(magnitude) {
    // You can use any logic to scale the marker size based on magnitude
    return Math.sqrt(magnitude) * 5;
  }

  // Function to determine the color of the marker based on depth
  function getMarkerColor(depth) {
    // Define your custom color scale based on depth ranges
    if (depth >= -10 && depth < 10) {
      return 'green'; // Depth between -10 to 10 feet (inclusive)
    } else if (depth >= 10 && depth < 30) {
      return 'yellow'; // Depth between 10 to 30 feet (inclusive)
    } else if (depth >= 30 && depth < 50) {
      return 'orange'; // Depth between 30 to 50 feet (inclusive)
    } else if (depth >= 50 && depth < 70) {
      return 'red'; // Depth between 50 to 70 feet (inclusive)
    } else if (depth >= 70 && depth < 90) {
      return 'purple'; // Depth between 70 to 90 feet (inclusive)
    } else {
      return 'blue'; // Depth greater than 90 feet
    }
  }

  // Create markers and popups for each earthquake
  data.features.forEach(feature => {
    const { geometry, properties } = feature;
    const { coordinates } = geometry;
    const [longitude, latitude, depth] = coordinates;
    const { mag } = properties;

    const marker = L.circleMarker([latitude, longitude], {
      radius: getMarkerSize(mag),
      fillColor: getMarkerColor(depth),
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);

    // Create a popup with additional information
    const popupContent = `
      <b>Magnitude:</b> ${mag}<br>
      <b>Depth:</b> ${depth} feet<br>
      <b>Latitude:</b> ${latitude}<br>
      <b>Longitude:</b> ${longitude}
    `;
    marker.bindPopup(popupContent);
  });

  // Add a legend to the map
  const legend = createLegend();
  legend.addTo(map);
}

function createLegend() {
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const depthRanges = [
      { range: '-10 to 10 feet', color: 'green' },
      { range: '10 to 30 feet', color: 'yellow' },
      { range: '30 to 50 feet', color: 'orange' },
      { range: '50 to 70 feet', color: 'red' },
      { range: '70 to 90 feet', color: 'purple' },
      { range: '90+ feet', color: 'blue' }
    ];

    let legendContent = '<strong>Depth Legend</strong><br>';
    for (const range of depthRanges) {
      legendContent += `
        <i class="legend-bubble" style="background:${range.color}"></i>
        ${range.range}<br>
      `;
    }

    div.innerHTML = legendContent;
    return div;
  };

  return legend;
}

