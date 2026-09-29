'use strict';

const { seed } = require('../src/bootstrap');

const result = seed();
console.log(`Done. Articles inserted: ${result.inserted}, admins created: ${result.createdAdmins}`);
