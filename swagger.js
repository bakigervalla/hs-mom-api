const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./server/api/api.js']

swaggerAutogen(outputFile, endpointsFiles)