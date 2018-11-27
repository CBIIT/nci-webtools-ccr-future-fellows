require('dotenv').config();
const should = require('chai').should();
const {
    getLookupTables,
    searchApplicants,
    addApplicant,
    updateApplicant
} = require('../../server/controllers');

describe('Future Fellows', function() {
    it('should correctly fetch lookup tables', async function() {
        const tables = await getLookupTables();
        tables.should.have.keys([
            'citizenship',
            'education_level',
            'job_category',
            'scientific_focus',
            'state',
        ]);
    })

    it('should correctly add fellow', function() {

    });
});