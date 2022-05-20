let should = require('should')
let supertest = require('supertest')
let server = supertest.agent('http://localhost:3000')
import { Account } from '../types/Account'

import { mockTestAccounts } from '../__test_utils__/fixtures'

should.Assertion.add('number', val => {
  return !!Number(val)
})

describe('POST, DELETE Open/Close Accounts:<---------> ', () => {
  let openedAccountId

  describe('POST account open request: ', () => {
    let balance = 3

    it('should return 200 and data match format', done => {
      server
        .post('/api/accounts/open')
        .send({ balance: balance })
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          res.status.should.equal(200)
          res.body.should.have.property('balance').which.is.a.Number()
          res.body.should.have.property('id')
          openedAccountId = res.body.id
          done()
        })
    })
  })

  describe('DELETE account close request: ', () => {
    it('should return 200', done => {
      server
        .delete('/api/accounts/close')
        .send({ id: openedAccountId })
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          res.status.should.equal(200)
          done()
        })
    })
  })
})

// PUT basic account access

describe('GET, PUT account access operations:<--------->', () => {
  const accountTemplate = {
    ownerName: 'Sem',
    balance: 100000000,
  }

  let currentAccountID

  beforeEach(done => {
    server
      .post('/api/accounts/open')
      .send({ balance: accountTemplate.balance })
      .end((err, res) => {
        currentAccountID = res.body.id
        done()
      })
  })

  afterEach(done => {
    server
      .delete('/api/accounts/close')
      .send({ id: currentAccountID })
      .end((err, res) => {
        currentAccountID = void 0
        done()
      })
  })

  describe('GET account balance request: ', () => {
    it('should return balance in correct format', done => {
      server
        .get('/api/accounts/account_status')
        .query({ id: currentAccountID })
        .send()
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          res.body.should.have.property('balance').which.equals(accountTemplate.balance)
          done()
        })
    })
  })

  describe('PUT update account balance (withdraw): ', () => {
    let debitAmount = 40

    it('should return success and correct new balance', done => {
      server
        .put('/api/accounts/withdraw')
        .send({
          id: currentAccountID,
          debit_amount: debitAmount,
        })
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          res.body.should.have
            .property('balance')
            .which.equals(accountTemplate.balance - debitAmount)
          done()
        })
    })
  })

  describe('PUT update account balance (deposit): ', () => {
    let creditAmount = 30

    it('should return success and correct new balance', done => {
      server
        .put('/api/accounts/deposit')
        .send({
          id: currentAccountID,
          credit_amount: creditAmount,
        })
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          res.body.should.have
            .property('balance')
            .which.equals(accountTemplate.balance + creditAmount)
          done()
        })
    })
  })
})

describe('POST account transfer: ', () => {
  let currentAccountID

  beforeEach(done => {
    let markedComplete = 0
    let taskDone = () => {
      markedComplete++
      if (markedComplete == 4) done()
    }

    server
      .post('/api/accounts/open')
      .send({
        balance: mockTestAccounts[0].balance,
        ownerName: mockTestAccounts[0].ownerName,
      })
      .end((err, res) => {
        mockTestAccounts[0].id = res.body.id
        taskDone()
      })

    server
      .post('/api/accounts/open')
      .send({
        balance: mockTestAccounts[1].balance,
        ownerName: mockTestAccounts[1].ownerName,
      })
      .end((err, res) => {
        mockTestAccounts[1].id = res.body.id
        taskDone()
      })

    server
      .post('/api/accounts/open')
      .send({
        balance: mockTestAccounts[2].balance,
        ownerName: mockTestAccounts[2].ownerName,
      })
      .end((err, res) => {
        mockTestAccounts[2].id = res.body.id
        taskDone()
      })

    server
      .post('/api/accounts/open')
      .send({
        balance: mockTestAccounts[3].balance,
        ownerName: mockTestAccounts[3].ownerName,
      })
      .end((err, res) => {
        mockTestAccounts[3].id = res.body.id
        taskDone()
      })
  })

  afterEach(done => {
    let markedDone = 0
    let taskDone = () => {
      markedDone++
      if (markedDone == 4) done()
    }

    server
      .delete('/api/accounts/close')
      .send({ id: mockTestAccounts[0].id })
      .end(() => taskDone())

    server
      .delete('/api/accounts/close')
      .send({ id: mockTestAccounts[1].id })
      .end(() => taskDone())

    server
      .delete('/api/accounts/close')
      .send({ id: mockTestAccounts[2].id })
      .end(() => taskDone())

    server
      .delete('/api/accounts/close')
      .send({ id: mockTestAccounts[3].id })
      .end(() => taskDone())
  })

  describe('POST transfer funds to another account: ', () => {
    it('given sufficient funds, should return success and correct new balance', done => {
      let transferAmount = 50

      server
        .post('/api/transfers/submit_transfer')
        .send({
          payer_id: mockTestAccounts[3].id,
          payee_id: mockTestAccounts[1].id,
          transfer_amount: transferAmount,
        })
        .expect('Content-type', /json/)
        .expect(200)
        .end((err, res) => {
          res.status.should.equal(200)
          res.body.should.have
            .property('payer_balance')
            .which.equals(mockTestAccounts[3].balance - transferAmount)
          res.body.should.have
            .property('payee_balance')
            .which.equals(mockTestAccounts[1].balance + transferAmount)
          done()
        })
    })

    it('given insufficient funds, should error', done => {
      let transferAmount = 1000

      server
        .post('/api/transfers/submit_transfer')
        .send({
          payer_id: mockTestAccounts[2].id,
          payee_id: mockTestAccounts[0].id,
          transfer_amount: transferAmount,
        })
        .expect('Content-type', /json/)
        .expect(403)
        .end((err, res) => {
          res.status.should.equal(403)
          done()
        })
    })
  })
})
