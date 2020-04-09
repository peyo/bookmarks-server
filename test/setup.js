require('dotenv').config();
const { expect } = require("chai");
const supertest = require("supertest");
const chai = require("chai");
chai.use(require("chai-string"));

global.expect = expect;
global.supertest = supertest;
