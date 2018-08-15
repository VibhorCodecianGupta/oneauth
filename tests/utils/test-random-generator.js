const chai = require('chai')
var assert = require('assert')
var expect = require('chai').expect;
var should = require('chai').should();
const { genNdigitNum } = require('../../src/utils/generator')

describe('Block', function(){
  
  it('Should return integer', function(){
    
    var random = genNdigitNum(4)
    expect(random).to.be.a('number')
  })
  
})