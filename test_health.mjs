import http from 'http';

const req = http.get('http://localhost:3000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
    req.destroy();
  });
});
req.on('error', e => console.error('Error:', e.message));