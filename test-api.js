/**
 * Local test script for the Zone 5 API
 */

const handler = require('./api/zone5-contributions.js');
const fs = require('fs');

// Mock request and response
const mockReq = {
  query: {
    theme: 'dark'
  }
};

const mockRes = {
  headers: {},
  statusCode: 200,
  body: '',

  setHeader(name, value) {
    this.headers[name] = value;
  },

  status(code) {
    this.statusCode = code;
    return this;
  },

  send(data) {
    this.body = data;
    console.log('✅ API Response:');
    console.log(`   Status: ${this.statusCode}`);
    console.log(`   Content-Type: ${this.headers['Content-Type']}`);
    console.log(`   Body length: ${data.length} characters`);

    // Save to file for inspection
    fs.writeFileSync('test-output.svg', data);
    console.log('\n💾 SVG saved to test-output.svg');
    console.log('   Open it in a browser to see the contribution graph!\n');
  }
};

// Run the handler
console.log('🧪 Testing Zone 5 API locally...\n');
handler(mockReq, mockRes);
