const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3100,
  path: '/upload/server-image',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`Status Code: ${res.statusCode}`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('Upload successful!');
      console.log('Response:', JSON.parse(data));
    } else {
      console.error('Upload failed.');
      console.error('Response:', JSON.parse(data));
    }
  });
});

req.on('error', (error) => {
  console.error('Error making API call:', error.message);
});

req.end(); 
