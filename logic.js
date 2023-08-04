// Replace 'your_json_url' with the URL to your earthquake JSON data
const jsonUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';


fetch(jsonUrl)
  .then(response => response.json())
  .then(data => createMap(data));
  console.log(data)

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
    // You can use any logic to assign colors based on depth
    // Here, we are using a linear scale from blue to red
    const normalizedDepth = depth / 700; // Assuming depths range from 0 to 700 km
    const hue = (1 - normalizedDepth) * 240; // Map depth to hue value from 0 (blue) to 240 (red)
    return `hsl(${hue}, 100%, 50%)`;
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
      <b>Depth:</b> ${depth} km<br>
      <b>Latitude:</b> ${latitude}<br>
      <b>Longitude:</b> ${longitude}
    `;
    marker.bindPopup(popupContent);
  });

  // Add a legend to the map
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    // Define your legend content here (e.g., depth ranges and corresponding colors)
    const legendContent = `
      <strong>Depth Legend</strong><br>
      <i style="background: ${getMarkerColor(0)}"></i> Depth &lt; 100 km<br>
      <i style="background: ${getMarkerColor(100)}"></i> Depth &ge; 100 km
    `;
    div.innerHTML = legendContent;
    return div;
  };
  legend.addTo(map);
}
