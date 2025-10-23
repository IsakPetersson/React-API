const apiUrl = 'https://your-api-endpoint.com/data'; // Replace with your API URL

async function decodeApiJson() {
  try {
    const response = await fetch(apiUrl);
    const base64Data = await response.text(); // Or response.json() if the base64 is a property

    // If the base64 string is inside a property, e.g. { "data": "base64string" }
    // const { data: base64Data } = await response.json();

    const decodedText = Buffer.from(base64Data, 'base64').toString('utf-8');
    console.log('Decoded Text:', decodedText);

    const jsonObj = JSON.parse(decodedText);
    console.log('Parsed JSON:', jsonObj);
  } catch (err) {
    console.error('Error:', err);
  }
}

decodeApiJson();