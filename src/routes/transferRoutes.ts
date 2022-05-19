import * as Account from '../models/account'

// transaction handler between accounts
export const handleTransfer = (req, res) => {
  const payerId = req.body.payer_id
  const payeeId = req.body.payee_id
  const transferAmount = req.body.transfer_amount

  Account.account
    .find({
      $or: [{ _id: payerId }, { _id: payeeId }],
    })
    .then(async function (data) {
      const payerAccount = data[data[0]._id == payerId ? 0 : 1]
      const payeeAccount = data[data[0]._id != payerId ? 0 : 1]

      if (!payerAccount || !payeeAccount) {
        return res.status(404).send('error finding account/accounts')
      }

      // transfer fee can also be added here

      payerAccount.balance -= transferAmount
      payeeAccount.balance += transferAmount

      // transfer can also be approved/rejected
      const transferApproved = true

      if (!transferApproved) {
        return res.status(403).send('transfer denied')
      } else if (payerAccount.balance < 0) {
        return res.status(403).send('non enough fund available')
      }

      Account.account.collection
        .bulkWrite([
          { updateOne: { filter: { _id: payerId }, update: payerAccount.toObject() } },
          { updateOne: { filter: { _id: payeeId }, update: payeeAccount.toObject() } },
        ])
        .then(data => {
          return res.status(200).send({
            payer_balance: payerAccount.balance,
            payee_balance: payeeAccount.balance,
          })
        })
        .catch(error => {
          return res.status(500).send('bulk operation failed')
        })
    })
    .catch(error => {
      return res.status(500).send(error)
    })
}
