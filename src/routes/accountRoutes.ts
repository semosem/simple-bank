import * as Account from '../models/account'

// getches an account
export const getAccount = async (req, res) => {
  try {
    const data = await Account.account.findOne({ _id: req.query.id })
    res.send({
      id: data._id,
      balance: data.balance,
      ownerName: data.ownerName,
    })
  } catch (error) {
    res.status(400).send({ error })
  }
}

// creates/opens an account
export const openAccount = async (req, res) => {
  try {
    const acc = await Account.createAccount({
      balance: req.body.balance ? req.body.balance : 0,
      ownerName: req.body.ownerName ? req.body.ownerName : void 0,
    })
    res.send({
      id: acc._id,
      balance: acc.balance,
      ownerName: acc.ownerName,
    })
  } catch (error) {
    console.log('erro', error)

    res.status(400).send({ error })
  }
}

// closes an account
export const closeAccount = (req, res) => {
  Account.closeAccount(req.body.id)
    .then(data => {
      res.send({
        id: req.params.id,
      })
    })
    .catch(err => res.status(400).send({ error: err }))
}

// deposits to an account

export const deposit = (req, res) => {
  Account.deposit(req.body.id, req.body.credit_amount)
    .then(data => res.send(data))
    .catch(err => res.status(500).send('deposit operation failed'))
}

// withdraw from an account

export const withdraw = (req, res) => {
  Account.withdraw(req.body.id, req.body.debit_amount)
    .then(data => res.send(data))
    .catch(err => {
      if (err.message == 'Insufficient funds') return res.status(403).send(err.message)
      else return res.status(500).send('An unknown error occurred during the withdraw operation')
    })
}
